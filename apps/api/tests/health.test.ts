import { describe, expect, it } from "vitest";
import { healthResponse } from "../src/routes/health.routes.js";

describe("health endpoint", () => {
  it("returns service health", async () => {
    expect(healthResponse()).toEqual({
      status: "ok",
      service: "live-match-tracker-api"
    });
  });
});
