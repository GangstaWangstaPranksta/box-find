import { json } from '@sveltejs/kit';
import { JsonDB, Config } from 'node-json-db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
    let db = new JsonDB(new Config("boxDatabase", false, false, '/'))
    const { id, editBoxName } = await request.json();
    console.log(id, editBoxName)
    let boxData = await db.getData(`/${id}`);
    await db.push(`/${editBoxName}`, boxData);
    await db.delete(`/${id}`)
    db.save();
    return json( `${id} box renamed to ${editBoxName}` );
}