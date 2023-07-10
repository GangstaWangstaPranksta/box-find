import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let imagesDB = new JsonDB(new Config('boxImagesDB', false, false, '/'));
	const { id } = await request.json();
	let imgs = await imagesDB.getData(`/${id}`);
	return json(imgs);
}
