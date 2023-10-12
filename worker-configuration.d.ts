interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	MEETUP_SCRAPPER_KV: KVNamespace;
	TIMEZONE_NAME: string;
}
