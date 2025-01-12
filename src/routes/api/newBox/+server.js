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
	const { id } = await request.json();
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db("test-box-db").collection("boxes");

		try {

			await collection.insertOne({ _id: id, contents: "", images: [], lastModified: Date.now() })
		}
		catch (e) {
			await client.close();
			if (e.code === 11000) {
				return json({ error: "Box already exists" }, { status: 409 });
			}
		}

	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
	return json({ id });
}
