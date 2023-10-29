const cleanText = (s: string) => s.trim().replace(/\s\s+/g, ' ');

class Scraper {
	url: URL | undefined;
	response: Response;
	clonedResponse: Response | undefined;
	rewriter: HTMLRewriter;

	constructor() {
		this.rewriter = new HTMLRewriter();
		this.response = new Response();
		return this;
	}

	async fetch(url: URL) {
		this.url = url;
		this.response = await fetch(url);
		this.clonedResponse = this.response.clone() || undefined;

		const server = this.response.headers.get('server');

		const isThisWorkerErrorNotErrorWithinScrapedSite =
			[530, 503, 502, 403, 400].includes(this.response.status) && (server === 'cloudflare' || !server) /* Workers preview editor */;

		if (isThisWorkerErrorNotErrorWithinScrapedSite) {
			throw new Error(`Status ${this.response.status} requesting ${url}`);
		}

		return this;
	}

	async getText(selectors: Array<string> = [], spaced: Boolean = false) {
		const matches: any = {};
		selectors = selectors.map((s: string) => s.trim());

		selectors.forEach((selector: string) => {
			matches[selector] = [];

			let nextText = '';

			this.rewriter.on(selector, {
				element(element: Element) {
					matches[selector].push(true);
					nextText = '';
				},

				text(text) {
					nextText += text.text;

					if (text.lastInTextNode) {
						if (spaced) nextText += ' ';
						matches[selector].push(nextText);
						nextText = '';
					}
				},
			});
		});

		const transformed = this.rewriter.transform(this.response);

		await transformed.arrayBuffer();

		selectors.forEach((selector: string) => {
			const nodeCompleteTexts = [];

			let nextText = '';

			matches[selector].forEach((text: string | Boolean) => {
				if (text === true) {
					if (nextText.trim() !== '') {
						nodeCompleteTexts.push(cleanText(nextText));
						nextText = '';
					}
				} else {
					nextText += text;
				}
			});

			const lastText = cleanText(nextText);
			if (lastText !== '') nodeCompleteTexts.push(lastText);
			matches[selector] = nodeCompleteTexts;
		});

		return selectors.length === 1 ? matches[selectors[0]] : matches;
	}

	async getAttributes(selectors: Array<string>, attributes: Array<string>) {
		class AttributeScraper {
			attr: string;
			values: Array<string> = [];

			constructor(attr: string) {
				this.attr = attr;
				this.values = [];
			}

			element(element: Element) {
				const value = element.getAttribute(this.attr);
				if (value) this.values.push(value.toLowerCase().trim());
			}
		}

		let results: { [key: string]: Array<string> } = {};

		// loop through all attribute selectors
		for (let i = 0; i < attributes.length; i++) {
			const attribute = attributes[i];
			const selector = selectors[i];
			const newResponse = this.clonedResponse?.clone() || this.response.clone();
			const scraper = new AttributeScraper(attribute);

			await new HTMLRewriter().on(selector, scraper).transform(newResponse).arrayBuffer();

			newResponse.body?.cancel();

			// remove duplicates
			scraper.values = [...new Set(scraper.values)];

			results[selector] = scraper.values;
		}

		return results;
	}

    clone() {
        const clone = new Scraper();
        clone.url = this.url;
        clone.response = this.response;
		clone.clonedResponse = this.clonedResponse;
        clone.rewriter = this.rewriter;
        return clone;
    }
}

export default Scraper;
