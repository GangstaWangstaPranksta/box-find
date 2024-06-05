import { MongoClient, ServerApiVersion } from 'mongodb';
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

/** @type {import('./$types').PageLoad} */
export async function load({}) {
	let lastPage;
	let images, contents;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		lastPage = Math.ceil((await collection.countDocuments()) / 10);

		let imagesCursor = collection
			.find({}, { sort: { lastModified: -1 }, projection: { images: 1 } })
			.limit(10);
		let contentsCursor = collection
			.find({}, { sort: { lastModified: -1 }, projection: { contents: 1 } })
			.limit(10);

		images = await imagesCursor.toArray();
		contents = await contentsCursor.toArray();
	} finally {
		// Ensures that the client will close when you finish/error
		if (client) await client.close();
	}

	return {
		contents: transformContents(contents),
		photos: transformImgs(images),
		lastPage: lastPage
	};
}

function transformImgs(arr) {
	const result = {};

	arr.forEach((item) => {
		const { _id, images } = item;
		result[_id] = images;
	});

	return result;
}

function transformContents(arr) {
	const result = {};

	arr.forEach((item) => {
		const { _id, contents } = item;
		// Parse the contents string into an array
		result[_id] = contents;
	});

	return result;
}
