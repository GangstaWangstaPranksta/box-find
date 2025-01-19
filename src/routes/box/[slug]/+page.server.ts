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

export const load: PageLoad = async ({ params }) => {
	const id = params.slug;
	let contents, images, boxExist;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		let box = await collection.findOne({ _id: id }, { sort: { lastModified: -1 }, projection: {} });

		boxExist = box != null;
		contents = boxExist ? box.contents : '';
		images = boxExist ? box.images : [];
	} finally {
		// Ensures that the client will close when you finish/error
		if (client) await client.close();
	}

	return {
		box: id,
		contents,
		images,
		boxExist
	};
};
