import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config()

let uri;
if(process.env.NODE_ENV !== 'production') {
	uri = `mongodb+srv://${process.env.MONGO_URI}`
} else {
	uri = `mongodb://${process.env.MONGO_URI}`
}

const client =  new MongoClient(uri, {
	serverApi: {
	  version: ServerApiVersion.v1,
	  strict: true,
	  deprecationErrors: true,
	},
  });

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	let contents, boxExist;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = await client.db("test-box-db").collection("boxes");
		let boxDataCursor = await collection.find({ _id: decodeURIComponent(params.slug) }, { sort: { lastModified: -1 }, projection: { }})
  
		contents = await boxDataCursor.toArray()

		boxExist = !(contents[0]===undefined)
		contents = (contents[0]===undefined) ? [{ images:[], contents:"" }] : contents

	
	  } finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	  }

	return {
		box: decodeURIComponent(params.slug),
		contents: await contents[0].contents,
		images: await contents[0].images,
		boxExist
	};
}