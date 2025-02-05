import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import type { RequestHandler } from './$types';
import { fuzzyFilter } from 'fuzzbunny';

export const GET: RequestHandler = async ({ url }) => {
	const query = decodeURIComponent(url.searchParams.get('query') || '');
	if (!query) return json({ error: 'No query provided' }, { status: 400 });
	await connectDB();
	let contents = await Box.find({}, { contents: 1 });
	let res;

	res = fuzzyFilter(contents, query, { fields: ['_id', 'contents'] });

	//fetch imgs for each result _id as promise and append to json as they resolve
	//await all promises
	let dbRes = [];
	for (let box of res) {
		dbRes.push(Box.findOne({ _id: box.item._id }, 'images'));
	}
	await Promise.all(dbRes).then((imgs) => {
		for (let i = 0; i < dbRes.length; i++) {
			if (imgs[i].images) res[i].item.images = imgs[i].images;
		}
	});

	return json(res);
};
