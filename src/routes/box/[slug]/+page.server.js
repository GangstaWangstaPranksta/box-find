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
	let currentTime = new Date().getHours();
	let primary = currentTime > 7 && currentTime < 21 ? '#19a619' : '#cf7f23';
	let hover = currentTime > 7 && currentTime < 21 ? '#2cb82c' : '#d18a38';
	let active = currentTime > 7 && currentTime < 21 ? '#098f09' : '#c96e06';

	return {
		box: decodeURIComponent(params.slug),
		primary: primary,
		hover: hover,
		active: active,
		contents: await contents[0].contents,
		images: await contents[0].images,
		boxExist
	};
}