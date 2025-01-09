# Box Find

A SvelteKit-based box storage organizer system using the IBM Carbon Components & Icon Library, sharp, uFuzzy, mongoDB, and @egjs/svelte-grid.

## Deployment
Locally hosted on a node server in Docker alongside mongoDB (see `docker-compose.yaml`).

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
- newBox
	- create new objects in the DB with specified box ID
	-  json body:
		- `{ id }`
- rawData
	- get raw JSON from entire DB
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
- search
	- paths `/1` and `/2` use different image fetching methods which may improve performance in some cases
	- search for boxes with IDs or contents that match `?query`
	-  URL query param: `query`

