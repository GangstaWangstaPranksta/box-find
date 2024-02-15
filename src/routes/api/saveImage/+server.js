import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
import sharp from 'sharp';
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

	const { id, base64 } = await request.json();

	const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
	const imageBuffer = Buffer.from(base64Data, 'base64');

	let orgWidth = (await sharp(imageBuffer).metadata()).width;
	const compressedBuffer = await sharp(imageBuffer)
		.withMetadata()
		.resize({ width: Math.floor(orgWidth / 2)})
		.jpeg({ quality: 75 })
		.toBuffer();

	const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

	let res;
	try {
	  // Connect the client to the server	(optional starting in v4.7)
	  await client.connect();
	  const collection = await client.db("test-box-db").collection("boxes");

	  res = await collection.updateOne({ _id: id }, { $push: { images: compressedBase64 }, $set: { lastModified: Date.now() } });  
  
	} finally {
	  // Ensures that the client will close when you finish/error
	  await client.close();
	}
	return json(res);
}
