import type { NextFunction, Request, Response } from "express";

// Body parsers and other Express middleware throw errors that already carry the
// status they want (express.json() throws 400 on malformed JSON). Honour those
// rather than flattening every failure into a 500.
function clientErrorStatus(error: unknown): number | null {
  if (typeof error !== "object" || error === null) return null;

  const status = (error as { status?: unknown; statusCode?: unknown }).status
    ?? (error as { statusCode?: unknown }).statusCode;

  return typeof status === "number" && status >= 400 && status < 500 ? status : null;
}

// Express 5 forwards rejected promises from async handlers here automatically,
// so controllers can just throw instead of try/catching every await.
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(error);
  }

  const status = clientErrorStatus(error);
  if (status !== null) {
    return res.status(status).json({ error: "Invalid request body" });
  }

  // Only genuine server faults get logged and hidden behind a generic message.
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}
