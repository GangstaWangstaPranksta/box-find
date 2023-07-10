import { JsonDB, Config } from 'node-json-db';
/** @type {import('./$types').PageLoad} */
export async function load() {
	let contentDB = new JsonDB(new Config("boxContentsDB", false, false, '/'))
	let imagesDB = new JsonDB(new Config("boxImagesDB", false, false, '/'))
	let currentTime = new Date().getHours();
	let primary = currentTime>7&&currentTime<21 ? "#19a619" : "#cf7f23"
	let hover = currentTime>7&&currentTime<21 ? "#2cb82c" : "#d18a38"
	let active = currentTime>7&&currentTime<21 ? "#098f09" : "#c96e06"
	return {
		primary: primary,
		hover: hover,
		active: active,
		contents: await contentDB.getData(`/`),
		photos: await imagesDB.getData(`/`)
	};
}
