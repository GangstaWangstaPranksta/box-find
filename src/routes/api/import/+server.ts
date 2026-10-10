import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import { isInlinePhoto } from '$lib/server/photo-storage';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let importObj;
	try {
		({ importObj } = await request.json());
		if (!Array.isArray(importObj)) throw new Error();
		// Portable exports contain inline data, never references to another server's files.
		for (const box of importObj) {
			if (!Array.isArray(box?.images)) throw new Error();
			for (const image of box.images) if (!isInlinePhoto(image)) throw new Error();
		}
	} catch {
		return json({ error: 'Import requires inline image data, not file URLs.' }, { status: 400 });
	}

	await connectDB();

	for (const box of importObj) {
		try {
			await Box.create({
				id: box.id,
				contents: box.contents,
				images: box.images,
				lastModified: Date.now()
			});
		} catch (e) {
			return json(
				{ error: 'Unexpected Server Error', details: (e as Error).message },
				{ status: 500 }
			);
		}
	}
	return json({ status: 'ok' });
};
