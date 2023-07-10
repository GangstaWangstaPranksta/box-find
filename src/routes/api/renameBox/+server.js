import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let contentDB = new JsonDB(new Config('boxContentsDB', false, false, '/'));
	let imageDB = new JsonDB(new Config('boxImagesDB', false, false, '/'));
	const { id, editBoxName } = await request.json();
	let content = await contentDB.getData(`/${id}`);
	let images = await imageDB.getData(`/${id}`);
	await contentDB.push(`/${editBoxName}`, content);
	await imageDB.push(`/${editBoxName}`, images);
	await contentDB.delete(`/${id}`);
	await imageDB.delete(`/${id}`);
	contentDB.save();
	imageDB.save();
	return json(`${id} box renamed to ${editBoxName}`);
}
