import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../env.js";

const BEARER = "Bearer ";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.get("authorization");

  if (!header?.startsWith(BEARER)) {
    return res.status(401).json({
      error: "authentication required",
    });
  }

  try {
    const payload = jwt.verify(
      header.slice(BEARER.length).trim(),
      JWT_SECRET
    );

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string"
    ) {
      return res.status(401).json({
        error: "invalid token",
      });
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
    };

    return next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: "token expired",
      });
    }

    return res.status(401).json({
      error: "invalid token",
    });
  }
}