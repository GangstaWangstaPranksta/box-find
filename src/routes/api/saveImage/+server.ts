import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import { PhotoError, storePhoto, validateBoxId } from '$lib/server/photo-storage';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const { id, base64 } = await request.json();
		validateBoxId(id);
		await connectDB();
		if (!(await Box.exists({ id }))) return json({ error: 'Box not found' }, { status: 404 });
		const image = await storePhoto(base64);
		const result = await Box.updateOne(
			{ id },
			{ $addToSet: { images: image }, $set: { lastModified: new Date() } }
		);
		if (!result.matchedCount) return json({ error: 'Box not found' }, { status: 404 });
		return json({ status: 'ok', image });
	} catch (error) {
		const status =
			error instanceof PhotoError ? error.status : error instanceof SyntaxError ? 400 : 500;
		return json(
			{ error: status === 500 ? 'Could not save photo' : (error as Error).message },
			{ status }
		);
	}
};
