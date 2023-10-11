import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { UnstableDevWorker } from "wrangler";
import { unstable_dev } from "wrangler";

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
        const response = await worker.fetch(`http://${worker.address}:8787/api/tridev/latest`);
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("application/json;charset=UTF-8");
        const responseBody: any = await response.json();
        expect(responseBody).toHaveProperty("link");
        expect(responseBody).toHaveProperty("title");
        expect(responseBody).toHaveProperty("details");
        expect(responseBody).toHaveProperty("date");
    });
});