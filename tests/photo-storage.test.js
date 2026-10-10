// @ts-nocheck -- Bun test globals and temporary fixtures.
import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import {
	decodePhoto,
	isInlinePhoto,
	portablePhoto,
	readPhoto,
	storePhoto,
	validateBoxId
} from '../src/lib/server/photo-storage.ts';
import { photoId, thumbnailUrl } from '../src/lib/photos.ts';

let directory;
let image;
const previous = process.env.PHOTO_STORAGE_DIR;
beforeAll(async () => {
	directory = await mkdtemp(join(tmpdir(), 'box-find-photo-tests-'));
	process.env.PHOTO_STORAGE_DIR = directory;
	image =
		'data:image/png;base64,' +
		(
			await sharp({ create: { width: 100, height: 100, channels: 3, background: '#ffaa00' } })
				.png()
				.toBuffer()
		).toString('base64');
});
afterAll(async () => {
	if (previous === undefined) delete process.env.PHOTO_STORAGE_DIR;
	else process.env.PHOTO_STORAGE_DIR = previous;
	await rm(directory, { recursive: true, force: true });
});

describe('disk photo storage', () => {
	test('small image stays small; canonical refs and retries are stable', async () => {
		const stored = await storePhoto(image);
		expect(photoId(stored)).toHaveLength(64);
		expect(await storePhoto(image)).toBe(stored);
		for (const filename of [stored, thumbnailUrl(stored)]) {
			const metadata = await sharp(await readPhoto(filename.split('/').at(-1))).metadata();
			expect(metadata.width).toBe(100);
			expect(metadata.height).toBe(100);
			expect(metadata.exif).toBeUndefined();
		}
	});
	test('large images have bounded original and thumbnail dimensions', async () => {
		const large =
			'data:image/png;base64,' +
			(
				await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#ffaa00' } })
					.png()
					.toBuffer()
			).toString('base64');
		const stored = await storePhoto(large);
		expect((await sharp(await readPhoto(stored.split('/').at(-1))).metadata()).width).toBe(2400);
		expect(
			(await sharp(await readPhoto(thumbnailUrl(stored).split('/').at(-1))).metadata()).width
		).toBe(480);
	});
	test('portable export resolves disk files and preserves legacy inline data', async () => {
		const exported = await portablePhoto(await storePhoto(image));
		expect(exported.startsWith('data:image/jpeg;base64,')).toBe(true);
		expect((await sharp(decodePhoto(exported)).metadata()).width).toBe(100);
		expect(await portablePhoto(image)).toBe(image);
		expect(thumbnailUrl(image)).toBe(image);
	});
	test('autorotates JPEG and removes metadata', async () => {
		const rotated =
			'data:image/jpeg;base64,' +
			(
				await sharp({ create: { width: 100, height: 50, channels: 3, background: '#336699' } })
					.withMetadata({ orientation: 6 })
					.jpeg()
					.toBuffer()
			).toString('base64');
		const stored = await storePhoto(rotated);
		const metadata = await sharp(await readPhoto(stored.split('/').at(-1))).metadata();
		expect([metadata.width, metadata.height]).toEqual([50, 100]);
		expect(metadata.orientation).toBeUndefined();
		expect(metadata.exif).toBeUndefined();
	});
	test('legacy data can exceed new upload size limit for delete/export/import', async () => {
		const legacy = 'data:image/jpeg;base64,' + 'AAAA'.repeat(3_600_000);
		expect(isInlinePhoto(legacy)).toBe(true);
		expect(await portablePhoto(legacy)).toBe(legacy);
		expect(() => decodePhoto(legacy)).toThrow('10 MiB');
	});
	test('rejects traversal, unknown files, nonimages, query operators and oversize data', async () => {
		expect(photoId('/api/photos/../../secret')).toBeNull();
		await expect(readPhoto('../../secret')).rejects.toMatchObject({ status: 404 });
		await expect(readPhoto('0'.repeat(64) + '.jpg')).rejects.toMatchObject({ status: 404 });
		expect(() => validateBoxId({ $ne: null })).toThrow();
		expect(() => decodePhoto('https://example.com/photo.jpg')).toThrow();
		await expect(storePhoto('data:image/png;base64,YmFk')).rejects.toMatchObject({ status: 400 });
		expect(() => decodePhoto('data:image/png;base64,' + 'a'.repeat(15_000_000))).toThrow('10 MiB');
	});
	test('rejects excess concurrent transformations with retryable error', async () => {
		const outcomes = await Promise.allSettled([
			storePhoto(image),
			storePhoto(image),
			storePhoto(image)
		]);
		expect(outcomes.filter((result) => result.status === 'fulfilled')).toHaveLength(2);
		expect(outcomes.find((result) => result.status === 'rejected').reason.status).toBe(503);
	});
});
