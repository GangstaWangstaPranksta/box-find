// Only canonical, app-owned photo URLs can address disk storage.
export const photoId = (value: unknown): string | null =>
	typeof value === 'string'
		? (/^\/api\/photos\/([a-f0-9]{64})\.jpg$/.exec(value)?.[1] ?? null)
		: null;

export const thumbnailUrl = (photo: string): string =>
	photoId(photo) ? photo.replace(/\.jpg$/, '-thumb.jpg') : photo;

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
