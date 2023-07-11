# Box Find
  

A SvelteKit-based box storage organizer system using the IBM Carbon Components & Icon Library, sharp, js-search, and node-json-db. 


## Deployment
Locally hosted on a node server in a Docker Conatiner, soon™

## API Routes
`/api/`

- deleteBox
	- delete the specified box from DB
	- json body:
		- `{ id }`
- delImage
	- delete the specified image from the specified box ID
	- json body:
		- `{ id, base64 }`
- getImgs
	- get all the images associated with the specified box ID
	-  json body:
		- `{ id }`
- newBox
	- create new objects in the DB with specified box ID
	-  json body:
		- `{ id }`
- rawContents
	- get raw JSON from contents DB
	-  json body:
	    - `{  }`
- rawImages
	- get raw JSON from images DB
		-  json body:
		- `{  }`
- renameBox
	- rename box from `id` to `editBoxName` while keeping assosiated data
	-  json body:
		- `{ id, editBoxName}`
-  saveContent
	- save `contents` as the contents of specified box ID
	-  json body:
		- `{ id, contents }`
- saveImage
	- add `base64` to array of images for specified box ID
	-  json body:
		- `{ id, base64 }`

