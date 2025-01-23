import type { boxData } from '$lib/types/types';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import type { PageServerLoad } from './$types';
import dotenv from 'dotenv';
dotenv.config();

export const load: PageServerLoad = async ({ params }) => {
	const id = params.slug;
	await connectDB();

	// Use .lean() to get a plain JavaScript object
	const box: boxData = await Box.findOne({ _id: id }).lean().exec();
	const boxExist = box != null;

	return {
		box: boxExist ? box._id : null,
		contents: boxExist ? box.contents : '',
		images: boxExist ? box.images : [],
		boxExist: boxExist
	};
};
