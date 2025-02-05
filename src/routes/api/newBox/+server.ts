import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import type { RequestHandler } from './$types';
import connectDB from '$lib/db/connect';

export const POST: RequestHandler = async ({ request }) => {
	const { id } = await request.json();
	await connectDB();
	let res = json({ error: 'Unexpected Server Error' }, { status: 500 });

	const insertedDoc = await Box.create({
		_id: id,
		contents: '',
		images: [],
		lastModified: Date.now()
	});
	res = json({ id: insertedDoc._id }, { status: 201 });
	return res;
};
