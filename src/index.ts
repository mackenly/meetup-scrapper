import apiRouter from './router';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname.startsWith('/api/')) {
			return apiRouter.handle(request, env);
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
