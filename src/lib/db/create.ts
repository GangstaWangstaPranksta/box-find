import type { boxDataLean } from '$lib/types/types';
import Box from '$lib/models/box';

const createBox = async (box: boxDataLean) => {
	//check if id is unique
	const existingBox = await Box.findById(box._id);
	if (existingBox) {
		throw new Error('Box with that id already exists');
	}
	//create box
	const newBox = new Box({
		_id: box._id,
		contents: box.contents,
		images: box.images,
		lastModified: Date.now()
	});
	await newBox.save();
	return newBox;
};

export default createBox;
