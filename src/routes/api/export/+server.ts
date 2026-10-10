import { json } from '@sveltejs/kit';
import Box from '$lib/models/box';
import connectDB from '$lib/db/connect';
import { portablePhoto } from '$lib/server/photo-storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		await connectDB();
		const boxes = await Box.find({}).select('-_id').lean();
		const result = [];
		for (const box of boxes) {
			const images = [];
			for (const image of box.images ?? []) images.push(await portablePhoto(image));
			result.push({ ...box, images });
		}
		return json(result);
	} catch {
		return json(
			{ error: 'Could not export inventory. Check that photo storage is available.' },
			{ status: 500 }
		);
	}
};
