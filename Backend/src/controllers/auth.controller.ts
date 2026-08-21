import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../db.js";
import { BCRYPT_SALT_ROUNDS, JWT_EXPIRES_IN, JWT_SECRET } from "../env.js";

// Deliberately permissive: one @, something either side, a dot in the domain.
// Real deliverability is proven by sending mail, not by a clever regex.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

// bcrypt silently truncates anything past 72 bytes, which would make two
// different long passwords equivalent. Reject instead of quietly accepting.
const MAX_PASSWORD_BYTES = 72;

// Keeps the unknown-email path as slow as a real one, so response time
// can't reveal which accounts exist.
const ABSENT_USER_HASH = bcrypt.hashSync(
  "no password produces this hash",
  BCRYPT_SALT_ROUNDS,
);

// Register and login must normalise identically.
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type RegisterBody = {
  email?: unknown;
  password?: unknown;
};

export async function register(req: Request, res: Response) {
  const { email, password } = (req.body ?? {}) as RegisterBody;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  // Store one canonical form so Foo@Example.com and foo@example.com cannot
  // both be registered — the unique index is case-sensitive.
  const normalizedEmail = normalizeEmail(email);

  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    return res.status(400).json({ error: "email is not valid" });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res
      .status(400)
      .json({ error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` });
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return res
      .status(400)
      .json({ error: `password must be at most ${MAX_PASSWORD_BYTES} bytes` });
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    return res.status(201).json({ user });
  } catch (error) {
    // P2002 is Prisma's unique constraint violation. Checking the error beats
    // a findUnique-then-create, which races two simultaneous signups.
    if (isUniqueConstraintError(error)) {
      return res.status(409).json({ error: "email is already registered" });
    }
    throw error;
  }
}

type LoginBody = {
  email?: unknown;
  password?: unknown;
};

export async function login(req: Request, res: Response) {
  const { email, password } = (req.body ?? {}) as LoginBody;

  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
  });

  const matches = await bcrypt.compare(password, user?.passwordHash ?? ABSENT_USER_HASH);

  if (!user || !matches) {
    // Same message either way, so neither confirms an account exists.
    return res.status(401).json({ error: "email or password is incorrect" });
  }

  // jti is what logout revokes; without it a token can't be singled out.
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    jwtid: randomUUID(),
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

  return res.status(200).json({
    token,
    user: { id: user.id, email: user.email },
  });
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}

export async function logout(req: Request, res: Response) {
  if (!req.user || !req.token) {
    return res.status(401).json({ error: "authentication required" });
  }

  await prisma.revokedToken.createMany({
    data: {
      jti: req.token.jti,
      userId: req.user.id,
      expiresAt: req.token.expiresAt,
    },
    // Logging out twice is not an error.
    skipDuplicates: true,
  });

  // Once a token would have expired anyway, the row stops earning its keep.
  await prisma.revokedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });

  return res.status(204).end();
}
