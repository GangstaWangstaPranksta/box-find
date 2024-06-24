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
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db('test-box-db').collection('boxes');
		
		let contentsCursor = collection.find({}, { projection: { contents: 1 } });
		contents = await contentsCursor.toArray();
		res = fuzzyFilter(contents, query, { fields: ['_id', 'contents'] });
		//fetch imgs for each result _id as promise and append to json as they resolve
		//await all promises
		let dbRes = []
		for(let box of res){
			dbRes.push(collection.findOne({_id: box.item._id}, {projection: {images: 1}}))
			}
			await Promise.all(dbRes)
		.then((imgs) => {
			for(let i = 0; i < dbRes.length; i++){
				if(imgs[i].images) res[i].item.images = imgs[i].images
			}
		})
	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}

	return json(res);
}
