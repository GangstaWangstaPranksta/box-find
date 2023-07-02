import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    let db = new JsonDB(new Config("boxDatabase", false, false, '/'))
    const { id } = await request.json();
    await db.delete(`/${id}`)
    db.save();
    return json( `${id} box deleted` );
}