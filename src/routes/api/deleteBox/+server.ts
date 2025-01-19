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
	const { id } = await request.json();
	let res;

	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		res = await collection.deleteOne({ _id: id });
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
	if (res.deletedCount === 0) {
		return json({ error: 'No box with id found' }, { status: 404 });
	} else if (res.deletedCount === 1) {
		return json({ status: 'ok' });
	} else {
		return json({ error: 'Unexpected Server Error' }, { status: 500 });
	}
};
