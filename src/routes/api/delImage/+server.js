import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let db = new JsonDB(new Config('boxImagesDB', false, false, '/'));
	const { id, base64 } = await request.json();
    let images = await db.getData(`/${id}`)
    
    images = images.filter(photo => photo !== base64)

	await db.push(`/${id}`, images);
	db.save();
	return json('done');
}
