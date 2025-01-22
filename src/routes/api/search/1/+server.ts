import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
import { fuzzyFilter } from 'fuzzbunny';
dotenv.config();

export const GET: RequestHandler = async ({ url }) => {
	const query = decodeURIComponent(url.searchParams.get('query') || '');
	if (!query) return json({ error: 'No query provided' }, { status: 400 });
	await connectDB();

	let contents = await Box.find({}, { contents: 1, images: 1 });
	let res;

	res = fuzzyFilter(contents, query, { fields: ['_id', 'contents'] });

	return json(res);
};
