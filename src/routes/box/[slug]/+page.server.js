import { JsonDB, Config } from 'node-json-db';
/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
	let contentDB = new JsonDB(new Config('boxContentsDB', false, false, '/'));
	let imageDB = new JsonDB(new Config('boxImagesDB', false, false, '/'));
	let currentTime = new Date().getHours();
	let primary = currentTime > 7 && currentTime < 21 ? '#19a619' : '#cf7f23';
	let hover = currentTime > 7 && currentTime < 21 ? '#2cb82c' : '#d18a38';
	let active = currentTime > 7 && currentTime < 21 ? '#098f09' : '#c96e06';
	let images = [];
	let boxExist = true;
	let contents = await contentDB.getData(`/${params.slug}`).catch((e) => {return e.toString()})
	if(dataPathError(contents)){
		boxExist = false;
	}else{
		images = await imageDB.getData(`/${params.slug}`)
	}
	return {
		box: params.slug,
		primary: primary,
		hover: hover,
		active: active,
		contents: contents,
		images,
		boxExist
	};
}

const dataPathError = (text) => {
	const pattern = /^DataError: Can't find dataPath: \/[^.]+\. Stopped at [^.]+$/;
    const regex = new RegExp(pattern);
    return regex.test(text);
}