import { ErrorRequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { ZodError } from "zod";
import { HttpError } from "../utils/http-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: err.issues.map((issue) => ({ path: issue.path, message: issue.message }))
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err?.name === "CastError" || (err?.value && !isValidObjectId(err.value))) {
    return res.status(400).json({ message: "Invalid resource id" });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal server error" });
};
