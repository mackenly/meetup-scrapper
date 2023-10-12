import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { UnstableDevWorker } from "wrangler";
import { unstable_dev } from "wrangler";

import { getTextFromHtml } from "./scrapper";

describe("Worker", () => {

    let worker: UnstableDevWorker;

    beforeAll(async () => {
        worker = await unstable_dev("src/index.ts", {
            experimental: { disableExperimentalWarning: false },
            config: "wrangler-example.toml"
        });
    });

    afterAll(async () => {
        await worker.stop();
    });

    it("should return 404 for root", async () => {
        const { status, headers } = await worker.fetch(`http://${worker.address}:8787/`);
        expect(status).toBe(404);
        expect(headers.get("content-type")).toBe("application/json;charset=UTF-8");
    });
    it("should return 404 for non-existent slug", async () => {
        const { status, headers } = await worker.fetch(`http://${worker.address}:8787/im-not-a-slug`);
        expect(status).toBe(404);
        expect(headers.get("content-type")).toBe("application/json;charset=UTF-8");
    });
    it("should return 200 and valid response for latest tridev event", async () => {
        const response = await worker.fetch(`http://${worker.address}:8787/api/tridev/latest?fresh=true`);
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json;charset=UTF-8");
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("link");
        expect(responseBody).toHaveProperty("title");
        expect(responseBody).toHaveProperty("description");
        expect(responseBody).toHaveProperty("date");
    });
    it("should return text when given a html and a regex that matches", () => {
        const html = "<h1>Nix Rules</h1>";
        const regex = /<h1>([^<]*)<\/h1>/;
        const result = getTextFromHtml(html, regex);
        expect(result).toBe("Nix Rules");
    });
    it("should return empty string when given a html and a regex that doesn't match", () => {
        const html = "<h1>Nix Rules</h1>";
        const regex = /<h2>([^<]*)<\/h2>/;
        const result = getTextFromHtml(html, regex);
        expect(result).toBe("");
    });
});