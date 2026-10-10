// @ts-nocheck -- Optional integration tests run only against an explicitly isolated server.
import { expect, test } from 'bun:test';
import sharp from 'sharp';
const base = process.env.PHOTO_TEST_URL;
const integration = base ? test : test.skip;
const request = async (path, body, method = 'PATCH') => {
	const options = {
		method,
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body)
	};
	return fetch(base + path, options);
};

integration(
	'photo API upload, retry, portable export, restore and immediate deletion',
	async () => {
		const id = 'photo-test-' + crypto.randomUUID();
		const restoredId = id + '-restore';
		try {
			expect((await request('/api/newBox', { id }, 'POST')).ok).toBe(true);
			const image =
				'data:image/png;base64,' +
				(
					await sharp({ create: { width: 100, height: 100, channels: 3, background: '#336699' } })
						.png()
						.toBuffer()
				).toString('base64');
			const saved = await request('/api/saveImage', { id, base64: image });
			expect(saved.status).toBe(200);
			const { image: url } = await saved.json();
			expect((await (await request('/api/saveImage', { id, base64: image })).json()).image).toBe(
				url
			);
			const original = await fetch(base + url);
			expect(original.status).toBe(200);
			expect((await sharp(Buffer.from(await original.arrayBuffer())).metadata()).width).toBe(100);
			expect((await fetch(base + url.replace('.jpg', '-thumb.jpg'))).status).toBe(200);
			expect((await fetch(base + url, { method: 'HEAD' })).status).toBe(200);
			const exported = await (await fetch(base + '/api/export')).json();
			const box = exported.find((item) => item.id === id);
			expect(box.images).toHaveLength(1);
			expect(box.images[0].startsWith('data:image/jpeg;base64,')).toBe(true);
			expect(
				(await request('/api/import', { importObj: [{ ...box, id: restoredId }] }, 'POST')).status
			).toBe(200);
			expect(
				(await request('/api/delImage', { id: restoredId, base64: box.images[0] })).status
			).toBe(200);
			expect((await request('/api/delImage', { id, base64: url })).status).toBe(200);
			const finalExport = await (await fetch(base + '/api/export')).json();
			expect(finalExport.find((item) => item.id === id).images).toEqual([]);
			expect(finalExport.find((item) => item.id === restoredId).images).toEqual([]);
			expect((await request('/api/saveImage', { id: { $ne: null }, base64: image })).status).toBe(
				400
			);
			expect(
				(await request('/api/saveImage', { id, base64: 'data:image/png;base64,YmFk' })).status
			).toBe(400);
			expect(
				(await request('/api/delImage', { id, base64: '/api/photos/../../secret' })).status
			).toBe(400);
			expect(
				(await request('/api/import', { importObj: [{ id: id + '-bad', images: [url] }] }, 'POST'))
					.status
			).toBe(400);
			expect((await fetch(base + '/api/photos/' + '0'.repeat(64) + '.jpg')).status).toBe(404);
		} finally {
			await request('/api/deleteBox', { id }, 'DELETE');
			await request('/api/deleteBox', { id: restoredId }, 'DELETE');
		}
	}
);
