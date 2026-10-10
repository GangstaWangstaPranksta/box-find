import { json } from '@sveltejs/kit';
import connectDB from '$lib/db/connect';
import Box from '$lib/models/box';
import { photoId } from '$lib/photos';
import { isInlinePhoto, PhotoError, validateBoxId } from '$lib/server/photo-storage';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request }) => {
	try {
		const { id, base64 } = await request.json();
		validateBoxId(id);
		if (!photoId(base64) && !isInlinePhoto(base64))
			throw new PhotoError('Provide a saved photo URL or inline image');
		await connectDB();
		const result = await Box.updateOne(
			{ id },
			{ $pull: { images: base64 }, $set: { lastModified: new Date() } }
		);
		if (!result.matchedCount) return json({ error: 'Box not found' }, { status: 404 });
		return json({ status: 'ok' });
	} catch (error) {
		const status =
			error instanceof PhotoError ? error.status : error instanceof SyntaxError ? 400 : 500;
		return json(
			{ error: status === 500 ? 'Could not remove photo' : (error as Error).message },
			{ status }
		);
	}
};
