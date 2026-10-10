import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { MAX_PHOTO_BYTES, photoId } from '../photos';

export class PhotoError extends Error {
	constructor(
		message: string,
		public status = 400
	) {
		super(message);
	}
}

const storageDirectory = () => resolve(process.env.PHOTO_STORAGE_DIR || 'data/photos');
const MAX_PIXELS = 25_000_000;
let active = 0;

export function isInlinePhoto(value: unknown): value is string {
	if (typeof value !== 'string') return false;
	const match = /^data:image\/(?:png|jpeg|jpg|webp|gif|tiff);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
		value
	);
	return !!match && match[1].length % 4 === 0;
}

export function decodePhoto(value: unknown): Buffer {
	if (typeof value !== 'string') throw new PhotoError('Provide an inline image');
	if (value.length > Math.ceil(MAX_PHOTO_BYTES / 3) * 4 + 100) {
		throw new PhotoError('Photos must be 10 MiB or smaller', 413);
	}
	const match = /^data:image\/(?:png|jpeg|jpg|webp|gif|tiff);base64,([A-Za-z0-9+/]+={0,2})$/.exec(
		value
	);
	if (!match || match[1].length % 4 !== 0) throw new PhotoError('Invalid image data');
	const bytes = Buffer.from(match[1], 'base64');
	if (!bytes.length || bytes.toString('base64') !== match[1])
		throw new PhotoError('Invalid image data');
	if (bytes.length > MAX_PHOTO_BYTES) throw new PhotoError('Photos must be 10 MiB or smaller', 413);
	return bytes;
}

export function validateBoxId(value: unknown): asserts value is string {
	if (typeof value !== 'string' || !value.trim() || value.length > 512) {
		throw new PhotoError('Provide a valid box ID');
	}
}

export async function storePhoto(value: unknown): Promise<string> {
	// Reject excess work instead of holding an unbounded queue of decoded uploads in memory.
	if (active >= 2) throw new PhotoError('Photo processing is busy. Try saving again.', 503);
	active++;
	try {
		const bytes = decodePhoto(value);
		let original: Buffer;
		let thumbnail: Buffer;
		try {
			original = await sharp(bytes, { limitInputPixels: MAX_PIXELS, animated: false })
				.rotate()
				.resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
				.jpeg({ quality: 82 })
				.toBuffer();
			thumbnail = await sharp(original)
				.resize(480, 480, { fit: 'inside', withoutEnlargement: true })
				.jpeg({ quality: 75 })
				.toBuffer();
		} catch {
			throw new PhotoError('Image could not be decoded (maximum 25 megapixels)');
		}
		const id = createHash('sha256').update(bytes).digest('hex');
		const directory = storageDirectory();
		await mkdir(directory, { recursive: true });
		for (const [suffix, buffer] of [
			['', original],
			['-thumb', thumbnail]
		] as const) {
			const filename = resolve(directory, `${id}${suffix}.jpg`);
			const temporary = `${filename}.${randomUUID()}.tmp`;
			await writeFile(temporary, buffer);
			await rename(temporary, filename);
		}
		return `/api/photos/${id}.jpg`;
	} finally {
		active--;
	}
}

export async function readPhoto(file: string): Promise<Buffer> {
	if (!/^[a-f0-9]{64}(?:-thumb)?\.jpg$/.test(file)) throw new PhotoError('Photo not found', 404);
	try {
		return await readFile(resolve(storageDirectory(), file));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT')
			throw new PhotoError('Photo not found', 404);
		throw error;
	}
}

export async function portablePhoto(image: string): Promise<string> {
	const id = photoId(image);
	if (!id) {
		if (!isInlinePhoto(image)) throw new PhotoError('Invalid stored photo');
		return image;
	}
	const bytes = await readPhoto(`${id}.jpg`);
	return `data:image/jpeg;base64,${bytes.toString('base64')}`;
}
