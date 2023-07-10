import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';
/** @type {import('./$types').RequestHandler} */
export async function GET() {
    let imagesDB = new JsonDB(new Config("boxImagesDB", false, false, '/'))
    return json(await contentDB.getData(`/`))
}
