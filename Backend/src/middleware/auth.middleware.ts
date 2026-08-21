import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db.js";
import { JWT_SECRET } from "../env.js";

const BEARER = "Bearer ";

export async function requireAuth(
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

  let payload: jwt.JwtPayload;

  try {
    const verified = jwt.verify(
      header.slice(BEARER.length).trim(),
      JWT_SECRET
    );

    if (typeof verified === "string") {
      return res.status(401).json({
        error: "invalid token",
      });
    }

    payload = verified;
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

  const { sub, email, jti, exp } = payload;

  if (
    typeof sub !== "string" ||
    typeof email !== "string" ||
    typeof jti !== "string" ||
    typeof exp !== "number"
  ) {
    return res.status(401).json({
      error: "invalid token",
    });
  }

  const revoked = await prisma.revokedToken.findUnique({ where: { jti } });

  if (revoked) {
    return res.status(401).json({
      error: "token revoked",
    });
  }

  req.user = {
    id: sub,
    email,
  };

  req.token = {
    jti,
    expiresAt: new Date(exp * 1000),
  };

  return next();
}
