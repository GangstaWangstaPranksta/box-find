import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
dotenv.config();

export const GET: RequestHandler = async () => {
	let res;
	await connectDB();
	res = await Box.find({});

	return json(res);
};
