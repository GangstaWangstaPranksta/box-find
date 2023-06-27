import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    let db = new JsonDB(new Config("boxDatabase", false, false, '/'))
    const { id, contents } = await request.json();
    console.log(id, contents)
    await db.push(`/${id}/contents`, contents)
    db.save();
    return json( "saved" );
}