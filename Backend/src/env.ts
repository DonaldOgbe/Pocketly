// Loaded first by every module that needs config, so dotenv runs before any
// import reads process.env. ESM evaluates imports before module bodies, so
// calling dotenv.config() inside server.ts would be too late for db.ts.
import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. See .env.example.`);
  }
  return value;
}

function numberOr(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer, got "${raw}".`);
  }
  return parsed;
}

export const DATABASE_URL = required("DATABASE_URL");
export const PORT = numberOr("PORT", 3000);
export const BCRYPT_SALT_ROUNDS = numberOr("BCRYPT_SALT_ROUNDS", 12);
