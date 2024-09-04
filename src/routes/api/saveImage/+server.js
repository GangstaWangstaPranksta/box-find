import { json } from '@sveltejs/kit';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
import sharp from 'sharp';
dotenv.config()

let uri;
if (process.env.NODE_ENV !== 'production') {
	uri = `mongodb+srv://${process.env.MONGO_URI}`
} else {
	uri = `mongodb://${process.env.MONGO_URI}`
}

const client = new MongoClient(uri, {
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

	const compressedBuffer = await sharp(imageBuffer)
		.withMetadata()
		.resize(6500, 6500, { fit: 'inside' })
		.jpeg({ quality: 75 })
		.toBuffer();

	const compressedBase64 = `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;

	let res;
	try {
		// Connect the client to the server	(optional starting in v4.7)
		await client.connect();
		const collection = client.db("test-box-db").collection("boxes");

		res = await collection.updateOne({ _id: id }, { $push: { images: compressedBase64 }, $set: { lastModified: Date.now() } });

	} finally {
		// Ensures that the client will close when you finish/error
		await client.close();
	}
	return json(res);
}
