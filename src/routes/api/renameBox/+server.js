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
	const { id, editBoxName } = await request.json();
	let res;
	try {
	  // Connect the client to the server	(optional starting in v4.7)
	  await client.connect();
	  const collection = await client.db("test-box-db").collection("boxes");	

	  let doc = await collection.findOne({ _id: id })
	  doc._id = editBoxName
	  doc.lastModified = Date.now()
	  await collection.insertOne(doc)
	  await collection.deleteOne({ _id: id })

	} finally {
	  // Ensures that the client will close when you finish/error
	  await client.close();
	}
	return json(`${id} box renamed to ${editBoxName}`);
}
