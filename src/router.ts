import { Router } from 'itty-router';
import { scrape } from './scrapper';

const router = Router();

router.get('/api/:id/latest', async (request, env) => {
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
		result = await scrape(id);
	} catch (err) {
		console.log(`Error is: ${err}`);
		return new Response('Error invalid url', { status: 404 });
	}

	// store the result in KV
	await env.MEETUP_SCRAPPER_KV.put(id + '-latest', JSON.stringify(result), {
		expirationTtl: 60 * 60 * 24, // 1 day
	});
	console.log("Stored value in KV")

	return new Response(JSON.stringify(result), {
		headers: {
			'content-type': 'application/json;charset=UTF-8',
		},
	});
});

router.get('/api/:id', async (request, env) => {
	// TODO: implement
	return new Response(JSON.stringify({
		"error": "Not implemented.",
	}), {
		status: 501,
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
	});
});

// 404 for everything else
router.all('*', () => {
	return new Response(JSON.stringify({
		"error": "Not found.",
	}), {
		status: 404,
		headers: {
			"content-type": "application/json;charset=UTF-8",
		},
	});
});

export default router;
