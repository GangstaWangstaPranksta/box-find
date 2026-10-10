import { json } from '@sveltejs/kit';
import { PhotoError, readPhoto } from '$lib/server/photo-storage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		return new Response(new Uint8Array(await readPhoto(params.file)), {
			headers: {
				'content-type': 'image/jpeg',
				'cache-control': 'public, max-age=31536000, immutable',
				'x-content-type-options': 'nosniff'
			}
		});
	} catch (error) {
		return json(
			{ error: error instanceof PhotoError ? error.message : 'Could not read photo' },
			{ status: error instanceof PhotoError ? error.status : 500 }
		);
	}
};
