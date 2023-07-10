import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';
import sharp from 'sharp';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let db = new JsonDB(new Config('boxImagesDB', false, false, '/'));
	const { id, base64 } = await request.json();

	const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
	const imageBuffer = Buffer.from(base64Data, 'base64');

	let orgWidth = (await sharp(imageBuffer).metadata()).width;
	const compressedBuffer = await sharp(imageBuffer)
		.resize({ width: Math.floor(orgWidth / 2) })
		.jpeg({ quality: 75 })
		.toBuffer();

	const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

	let oldImages = await db.getData(`/${id}`);
	await db.push(`/${id}`, [...oldImages, compressedBase64]);
	db.save();
	return json('done');
}
