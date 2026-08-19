import { Router } from "express";
import { register } from "./controllers/auth.controller.js";
import { saveBookmark } from "./controllers/bookmark.controller.js";
import { fakeAuth } from "./middleware/fakeauth.middleware.js";

// Every route in the app is declared here, then mounted once in server.ts.
const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/auth/register", register);

router.post("/bookmark", fakeAuth, saveBookmark);

export default router;
