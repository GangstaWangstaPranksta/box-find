import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';
/** @type {import('./$types').PageLoad} */
export async function GET() {
	let contentDB = new JsonDB(new Config("boxContentsDB", false, false, '/'))
	return json(await contentDB.getData(`/`))
}
