import { json } from '@sveltejs/kit';
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

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const { id, contents } = await request.json();
	let res;
	try {
	  // Connect the client to the server	(optional starting in v4.7)
	  await client.connect();
	  const collection = await client.db("test-box-db").collection("boxes");

	  res = await collection.updateOne({ _id: id }, { $set: { contents: contents, lastModified: Date.now() } });
  
	} finally {
	  // Ensures that the client will close when you finish/error
	  await client.close();
	}
	return json(res);
}