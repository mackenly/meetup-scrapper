import { Router, createCors } from 'itty-router';
import { getLatestEventId, scrapeEvent, scrapeGroup } from './utils';

const { preflight, corsify } = createCors();

const router = Router()

	// preflight requests
	.all('*', preflight)

	// fav is not found
	.get('/favicon.ico', () => {
		return new Response(null, {
			status: 204,
		});
	})

	// endpoint for the latest event
	.get('/api/:id/latest', async (request, env) => {
		// extract the id from the request params
		const { id } = request.params;

		// validate the id
		if (!id) {
			return new Response(JSON.stringify({
				"error": "Missing id.",
			}), {
				status: 400,
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});
		}

		// if ?fresh=true is passed, force a fresh scrape
		if (request.query.fresh) {
			console.log("Fresh scrape requested")
		} else {
			// check if the result is already stored in KV and return it
			const stored = await env.MEETUP_SCRAPPER_KV.get(id + '-latest');
			if (stored) {
				console.log("Returning stored value")
				return new Response(stored, {
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
				});
			}
		}

		// get scrapper result
		let result;
		try {
			let eventId = await getLatestEventId(id, env);
			result = await scrapeEvent(id, eventId, env);

		} catch (err) {
			console.log(`Error is: ${err}`);
			return new Response('Error invalid url', { status: 404 });
		}

		// store the result in KV
		await env.MEETUP_SCRAPPER_KV.put(id + '-latest', JSON.stringify(result), {
			expirationTtl: env.CACHE_TTL || 60 * 60 * 24, // 1 day
		});
		console.log("Stored value in KV")

		return new Response(JSON.stringify(result), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	})

	// endpoint for the latest event
	.get('/api/:id/:eventId', async (request, env) => {
		// extract the id from the request params
		const { id, eventId } = request.params;

		// validate the id
		if (!id || !eventId) {
			return new Response(JSON.stringify({
				"error": "Missing id.",
			}), {
				status: 400,
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});
		}

		// if ?fresh=true is passed, force a fresh scrape
		if (request.query.fresh) {
			console.log("Fresh scrape requested")
		} else {
			// check if the result is already stored in KV and return it
			const stored = await env.MEETUP_SCRAPPER_KV.get(id + '-' + eventId);
			if (stored) {
				console.log("Returning stored value")
				return new Response(stored, {
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
				});
			}
		}

		// get scrapper result
		let result;
		try {
			result = await scrapeEvent(id, eventId, env);

		} catch (err) {
			console.log(`Error is: ${err}`);
			return new Response('Error invalid url', { status: 404 });
		}

		// store the result in KV
		await env.MEETUP_SCRAPPER_KV.put(id + '-' + eventId, JSON.stringify(result), {
			expirationTtl: env.CACHE_TTL || 60 * 60 * 24, // 1 day
		});
		console.log("Stored value in KV")

		return new Response(JSON.stringify(result), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	})

	// endpoint for a group
	.get('/api/:id', async (request, env) => {
		// extract the id from the request params
		const { id } = request.params;

		// validate the id
		if (!id) {
			return new Response(JSON.stringify({
				"error": "Missing id.",
			}), {
				status: 400,
				headers: {
					"content-type": "application/json;charset=UTF-8",
				},
			});
		}

		// if ?fresh=true is passed, force a fresh scrape
		if (request.query.fresh) {
			console.log("Fresh scrape requested")
		} else {
			// check if the result is already stored in KV and return it
			const stored = await env.MEETUP_SCRAPPER_KV.get(id + '-group');
			if (stored) {
				console.log("Returning stored value")
				return new Response(stored, {
					headers: {
						'content-type': 'application/json;charset=UTF-8',
					},
				});
			}
		}

		// get scrapper result
		let result;
		try {
			result = await scrapeGroup(id, env);

		} catch (err) {
			console.log(`Error is: ${err}`);
			return new Response('Error invalid url', { status: 404 });
		}

		// store the result in KV
		await env.MEETUP_SCRAPPER_KV.put(id + '-group', JSON.stringify(result), {
			expirationTtl: env.CACHE_TTL || 60 * 60 * 24, // 1 day
		});
		console.log("Stored value in KV")

		return new Response(JSON.stringify(result), {
			headers: {
				'content-type': 'application/json;charset=UTF-8',
			},
		});
	})

	// 404 for everything else
	.all('*', () => {
		return new Response(JSON.stringify({
			"error": "Not found.",
		}), {
			status: 404,
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		});
	});

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			return router.handle(request, env).then(corsify);
		}

		return new Response(JSON.stringify({
			"error": "Not found.",
		}), {
			status: 404,
			headers: {
				"content-type": "application/json;charset=UTF-8",
			},
		});
	},
};
