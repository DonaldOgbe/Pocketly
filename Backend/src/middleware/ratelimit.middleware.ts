import rateLimit from "express-rate-limit";

// Login and register are the endpoints worth guessing against. The constant
// -time compare in login stops account enumeration but not brute force.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts, try again later" },
});
