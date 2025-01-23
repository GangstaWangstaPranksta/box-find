import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
dotenv.config();

export const PATCH: RequestHandler = async ({ request }) => {
	const { id, editBoxName } = await request.json();
	if (!id || !editBoxName) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}
	if (id === editBoxName) {
		return json({ error: 'New name cannot be the same as the old name' }, { status: 400 });
	}
	await connectDB();

	const originalBox = await Box.findById(id);
	if (!originalBox) {
		return json({ error: 'Box not found' }, { status: 404 });
	}
	const newBox = await Box.create({
		_id: editBoxName,
		contents: originalBox.contents,
		images: originalBox.images,
		lastModified: Date.now()
	});
	await Box.findByIdAndDelete({ _id: id });

	return json(`${id} box renamed to ${newBox._id}`);
};
