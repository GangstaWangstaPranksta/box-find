import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	let db = new JsonDB(new Config('boxContentsDB', false, false, '/'));
	const { id, contents } = await request.json();
	await db.push(`/${id}`, contents);
	db.save();
	return json('saved');
}
