# Box Find

A SvelteKit-based box storage organizer using shadcn-svelte, Tailwind CSS, sharp, fuzzbunny, and MongoDB.

## Deployment

Locally hosted on a node server in Docker alongside mongoDB (see `docker-compose.yaml`).

### Demo mode

Set `ENVIRONMENT=DEMO` to make the application browse-only. In demo mode, the UI displays a notice and editing actions explain that changes are restricted. The server also rejects every non-read-only `/api/` request with `403`, so direct API calls cannot change data.

To enable it with Docker Compose, uncomment the `ENVIRONMENT=DEMO` entry in `docker-compose.yaml`. The default deployment allows changes.

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
  - json body:
    - `{ id }`
- rawData
  - get raw JSON from entire DB
  - json body:
    - `{  }`
- renameBox
  - rename box from `id` to `editBoxName` while keeping assosiated data
  - json body:
    - `{ id, editBoxName}`
- saveContent
  - save `contents` as the contents of specified box ID
  - json body:
    - `{ id, contents }`
- saveImage
  - add `base64` to array of images for specified box ID
  - json body:
    - `{ id, base64 }`
- search
  - paths `/1` and `/2` use different image fetching methods which may improve performance in some cases
  - search for boxes with IDs or contents that match `?query`
  - URL query param: `query`

## Photo storage and backups

New uploads are stored on disk, not as base64 MongoDB fields. `PHOTO_STORAGE_DIR`
sets the directory (default `data/photos`); Docker Compose mounts the persistent
`photos-data` volume at `/app/data/photos`. Rebuild the image and recreate the app
container when deploying this version. Custom deployments must provide a writable,
persistent directory owned by the app user. A read-only or unavailable directory
causes an explicit failed save; it does not fall back to database image blobs.

Uploads are limited to 10 MiB and 25 megapixels. Photos are autorotated, metadata is
removed, and JPEGs are fitted within 2400 pixels without enlarging small images.
Inventory cards request separate 480-pixel thumbnails. Animated inputs use the
first frame. SHA256 IDs make retries of the same upload idempotent, including
across boxes. The server runs at most two transformations at once; extra requests
receive a retryable 503. The editor uploads its queue sequentially.

Existing inline photos remain readable, removable and portable even if they exceed
the new upload limit; no migration is performed.
Removing a photo or box removes its database reference. Files are retained on disk
because other boxes or backups may reference the same content. This deliberately
avoids unsafe physical deletion; disk usage can grow until a future garbage
collector accounts for live references and backup retention.

Back up **both MongoDB and the photo volume**, ideally while writes are paused.
Restore both together. `/api/export` creates a portable JSON export by resolving
stored originals into inline JPEG data. `/api/import` accepts inline images only,
so that export can restore onto a fresh installation without the original volume;
restored photos remain inline until re-uploaded. Internal file URLs are rejected
before import writes. Export fails explicitly if any referenced photo is missing.
Large portable exports still require enough RAM and a suitable HTTP body limit;
import remains sequential and can partially complete on database conflicts.

`PATCH /api/saveImage` returns `{ status: 'ok', image: '/api/photos/<sha256>.jpg' }`.
Clients must retain that canonical identity for subsequent deletion. The existing
`PATCH /api/delImage` `{ id, base64 }` accepts either that URL or legacy inline data.
