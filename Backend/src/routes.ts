import { Router } from "express";
import { login, logout, register } from "./controllers/auth.controller.js";
import { getBookmark, saveBookmark } from "./controllers/bookmark.controller.js";
import { requireAuth } from "./middleware/auth.middleware.js";


const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/auth/register", register);

router.post("/auth/login", login);

router.post("/auth/logout", requireAuth, logout);

router.post("/bookmarks", requireAuth, saveBookmark);

router.get("/bookmarks", requireAuth, getBookmark);

export default router;