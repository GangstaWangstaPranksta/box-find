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
export async function load() {
	let images, contents;
	try {
	  // Connect the client to the server	(optional starting in v4.7)
	  await client.connect();
	  const collection = await client.db("test-box-db").collection("boxes");
	  let imagesCursor = await collection.find({  }, { sort: { lastModified: -1 }, projection: {images: 1}}).limit(10);
	  let contentsCursor = await collection.find({  }, { sort: { lastModified: -1 }, projection: {contents: 1}}).limit(10);

	  images = await imagesCursor.toArray()
	  contents = await contentsCursor.toArray()
  
  
  
	} finally {
	  // Ensures that the client will close when you finish/error
	  await client.close();
	}

	let currentTime = new Date().getHours();
	let primary = currentTime>7&&currentTime<21 ? "#19a619" : "#cf7f23"
	let hover = currentTime>7&&currentTime<21 ? "#2cb82c" : "#d18a38"
	let active = currentTime>7&&currentTime<21 ? "#098f09" : "#c96e06"

	return {
		primary: primary,
		hover: hover,
		active: active,
		contents: transformContents(await contents),
		photos: transformImgs(await images)
	};
}

function transformImgs(arr) {
    const result = {};

    arr.forEach(item => {
        const { _id, images } = item;
        result[_id] = images;
    });

    return result;
}

function transformContents(arr) {
    const result = {};

    arr.forEach(item => {
        const { _id, contents } = item;
        // Parse the contents string into an array
        result[_id] = contents;
    });

    return result;
}
