import { describe, expect, it } from "vitest";
import { applyEventToScore } from "../src/services/match-rules.js";

describe("match rules", () => {
  it("does not change score for non-goal events", () => {
    const score = applyEventToScore({ homeScore: 1, awayScore: 0 }, { type: "yellow_card", team: "away" });

    expect(score).toEqual({ homeScore: 1, awayScore: 0 });
  });

  it("increments home score for a home goal", () => {
    const score = applyEventToScore({ homeScore: 1, awayScore: 0 }, { type: "goal", team: "home" });

    expect(score).toEqual({ homeScore: 2, awayScore: 0 });
  });

  it("increments away score for an away goal", () => {
    const score = applyEventToScore({ homeScore: 1, awayScore: 0 }, { type: "goal", team: "away" });

    expect(score).toEqual({ homeScore: 1, awayScore: 1 });
  });
});
