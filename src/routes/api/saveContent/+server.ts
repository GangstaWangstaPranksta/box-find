import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
dotenv.config();

export const POST: RequestHandler = async ({ request }) => {
	const { id, contents } = await request.json();
	if (!id || !contents) {
		return json({ error: 'Invalid request' }, { status: 400 });
	}
	await connectDB();

	const box = await Box.findById(id);
	if (box) {
		box.contents = contents;
		box.lastModified = Date.now();
		await box.save();
	} else {
		return json({ error: 'Box not found' }, { status: 404 });
	}
	return json({ status: 'ok' });
};
