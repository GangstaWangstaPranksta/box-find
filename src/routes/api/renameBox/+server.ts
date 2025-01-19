import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';
import type { RequestHandler } from './$types';
import dotenv from 'dotenv';
dotenv.config();

let uri;
if (process.env.NODE_ENV !== 'production') {
	uri = `mongodb+srv://${process.env.MONGO_URI}`;
} else {
	uri = `mongodb://${process.env.MONGO_URI}`;
}

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true
	}
});

export const POST: RequestHandler = async ({ request }) => {
	const { id, editBoxName } = await request.json();
	let res;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		let doc = await collection.findOne({ _id: id });
		if (doc) {
			doc._id = editBoxName;
			doc.lastModified = Date.now();
			await collection.insertOne(doc);
			await collection.deleteOne({ _id: id });
		} else {
			throw new Error(`Document with id ${id} not found`);
		}
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
	return json(`${id} box renamed to ${editBoxName}`);
};
