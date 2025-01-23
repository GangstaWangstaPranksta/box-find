import { json } from '@sveltejs/kit';
import connectDB from '$lib/db/connect';
import Box from '$lib/models/box';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
dotenv.config();

export const POST: RequestHandler = async ({ request }) => {
	const { id, base64 } = await request.json();
	await connectDB();
	const box = await Box.findById(id);
	if (box) {
		box.images.pull(base64);
		box.lastModified = Date.now();
		await box.save();
	} else {
		return json({ error: 'Box not found' }, { status: 404 });
	}

	return json({ status: 'ok' });
};
