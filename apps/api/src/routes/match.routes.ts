import { Router } from "express";
import {
  addMatchEvent,
  createMatch,
  finishMatch,
  getMatch,
  listMatches,
  listMatchEvents,
  startMatch,
  updateMatch
} from "../services/match.service.js";
import { validateBody } from "../middleware/validate.js";
import { createEventSchema, createMatchSchema, updateMatchSchema } from "../validation/match.schemas.js";

export const matchRouter = Router();

matchRouter.get("/matches", async (_req, res, next) => {
  try {
    res.json(await listMatches());
  } catch (error) {
    next(error);
  }
});

matchRouter.post("/matches", validateBody(createMatchSchema), async (req, res, next) => {
  try {
    res.status(201).json(await createMatch(req.body));
  } catch (error) {
    next(error);
  }
});

matchRouter.get("/matches/:id", async (req, res, next) => {
  try {
    res.json(await getMatch(String(req.params.id)));
  } catch (error) {
    next(error);
  }
});

matchRouter.patch("/matches/:id", validateBody(updateMatchSchema), async (req, res, next) => {
  try {
    res.json(await updateMatch(String(req.params.id), req.body));
  } catch (error) {
    next(error);
  }
});

matchRouter.get("/matches/:id/events", async (req, res, next) => {
  try {
    res.json(await listMatchEvents(String(req.params.id)));
  } catch (error) {
    next(error);
  }
});

matchRouter.post("/matches/:id/events", validateBody(createEventSchema), async (req, res, next) => {
  try {
    const result = await addMatchEvent(String(req.params.id), req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

matchRouter.post("/matches/:id/start", async (req, res, next) => {
  try {
    res.json(await startMatch(String(req.params.id)));
  } catch (error) {
    next(error);
  }
});

matchRouter.post("/matches/:id/finish", async (req, res, next) => {
  try {
    res.json(await finishMatch(String(req.params.id)));
  } catch (error) {
    next(error);
  }
});
