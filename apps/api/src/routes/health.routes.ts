import { Router } from "express";

export const healthRouter = Router();

export function healthResponse() {
  return { status: "ok", service: "live-match-tracker-api" };
}

healthRouter.get("/health", (_req, res) => {
  res.json(healthResponse());
});
