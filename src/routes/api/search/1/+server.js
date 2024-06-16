import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { fuzzyFilter } from 'fuzzbunny';
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

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const query = decodeURIComponent(url.searchParams.get('query'));
    let contents;
	let res;
	let t1 = performance.now()
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');

		let contentsCursor = collection
			.find({}, { projection: { contents: 1, images: 1 } })
        contents = await contentsCursor.toArray();
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
    
    res = fuzzyFilter(contents, query, { fields: ['_id','contents'] });

	let t2 = performance.now()
	console.log(t2-t1)
	
	return json(res);
}