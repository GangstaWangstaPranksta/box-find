import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
import connectDB from '$lib/db/connect';
dotenv.config();

export const POST: RequestHandler = async ({ request }) => {
	await connectDB();
	const { id } = await request.json();
	let res = json({ error: 'Unexpected Server Error' }, { status: 500 });

	const insertedDoc = await Box.create({
		_id: id,
		contents: '',
		images: [],
		lastModified: Date.now()
	});
	res = json({ id: insertedDoc._id });
	return res;
};
