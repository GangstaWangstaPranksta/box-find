import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config()
const client =  new MongoClient(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@${process.env.MONGO_URL}/?retryWrites=true&w=majority`, {
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
		let boxDataCursor = await collection.find({ _id: params.slug }, { sort: { lastModified: -1 }, projection: { }})
  
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
		box: params.slug,
		primary: primary,
		hover: hover,
		active: active,
		contents: await contents[0].contents,
		images: await contents[0].images,
		boxExist
	};
}