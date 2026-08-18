import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import prisma from "../db.js";
import { BCRYPT_SALT_ROUNDS } from "../env.js";

// Deliberately permissive: one @, something either side, a dot in the domain.
// Real deliverability is proven by sending mail, not by a clever regex.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIN_PASSWORD_LENGTH = 8;

// bcrypt silently truncates anything past 72 bytes, which would make two
// different long passwords equivalent. Reject instead of quietly accepting.
const MAX_PASSWORD_BYTES = 72;

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
  const normalizedEmail = email.trim().toLowerCase();

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

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "P2002"
  );
}
