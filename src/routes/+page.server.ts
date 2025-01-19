import { MongoClient, ServerApiVersion } from 'mongodb';
import type { PageLoad } from './$types';
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

export const load: PageLoad = async ({}) => {
	let lastPage;
	let contents;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		lastPage = Math.ceil((await collection.countDocuments()) / 10);

		let contentsCursor = collection
			.find({}, { sort: { lastModified: -1 }, projection: { images: 1, contents: 1 } })
			.limit(10);

		contents = await contentsCursor.toArray();
		for (let i = 0; i < contents.length; i++) {
			if (contents[i].images?.length > 5) {
				contents[i].images = contents[i].images.slice(0, 5);
			}
		}
	} finally {
		// Ensures that the client will close when you finish/error
		if (client) await client.close();
	}

	return {
		contents: contents,
		lastPage: lastPage
	};
};
