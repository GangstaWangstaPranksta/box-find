import { MongoClient, ServerApiVersion } from 'mongodb';
import type { PageLoad } from './$types';
import dotenv from 'dotenv';
import { redirect } from '@sveltejs/kit';
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
	//check if the page is a number, if not redirect to home
	const regex = /^[0-9]+$/;
	if (!regex.test(params.slug)) redirect(307, `/`);
	let page = parseInt(params.slug);
	if (page == 0) redirect(307, `/`);
	let lastPage;
	let contents;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		//if current page is too high, set it to the last page
		let count = await collection.countDocuments();
		lastPage = Math.ceil(count / 10);
		if (page > lastPage) {
			page = lastPage;
			redirect(307, `/page/${page}`);
		}

		let contentsCursor = collection
			.find({}, { sort: { lastModified: -1 }, projection: { contents: 1, images: 1 } })
			.skip((page - 1) * 10)
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
		page: page,
		lastPage: lastPage
	};
};
