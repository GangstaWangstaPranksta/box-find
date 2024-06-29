import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config()

let uri;
if (process.env.NODE_ENV !== 'production') {
	uri = `mongodb+srv://${process.env.MONGO_URI}`
} else {
	uri = `mongodb://${process.env.MONGO_URI}`
}

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { id, contents } = await request.json();
	let res;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = await client.db("test-box-db").collection("boxes");

		res = await collection.updateOne({ _id: id }, { $set: { contents: contents, lastModified: Date.now() } });

	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
	return json(res);
}