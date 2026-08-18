import { Router } from "express";
import { register } from "./controllers/auth.controller.js";

// Every route in the app is declared here, then mounted once in server.ts.
const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/auth/register", register);

export default router;
