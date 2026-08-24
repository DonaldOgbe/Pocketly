import { Router } from "express";
import { login, logout, register } from "./controllers/auth.controller.js";
import { deleteBookmark, getBookmark, saveBookmark, toggleFavorite , updateBookmark} from "./controllers/bookmark.controller.js";
import { requireAuth } from "./middleware/auth.middleware.js";
import { createCollection, getCollections, updateCollection, deleteCollection, addBookmarkToCollection, removeBookmarkFromCollection } from "./controllers/collection.controller.js";
import {createTag, getTags, updateTag, deleteTag, addBookmarkToTag, removeBookmarkFromTag} from "./controllers/tag.controller.js"

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.post("/auth/register", register);

router.post("/auth/login", login);

router.post("/auth/logout", requireAuth, logout);

// Bookmark Routes
router.post("/bookmarks", requireAuth, saveBookmark);
router.get("/bookmarks", requireAuth, getBookmark);
router.patch("/bookmarks/:id", requireAuth, updateBookmark);
router.patch("/bookmarks/:id/favorite", requireAuth, toggleFavorite);
router.delete("/bookmarks/:id", requireAuth, deleteBookmark);

// Collection Routes
router.post("/collections", requireAuth, createCollection);
router.get("/collections", requireAuth, getCollections);
router.patch("/collections/:id", requireAuth, updateCollection);
router.delete("/collections/:id", requireAuth, deleteCollection);

router.post("/collections/:id/bookmarks", requireAuth, addBookmarkToCollection);
router.delete("/collections/:id/bookmarks/:bookmarkId", requireAuth, removeBookmarkFromCollection);

// Tag Routes
router.post("/tags", requireAuth, createTag);
router.get("/tags", requireAuth, getTags);
router.patch("/tags/:id", requireAuth, updateTag);
router.delete("/tags/:id", requireAuth, deleteTag);

router.post("/tags/:id/bookmarks", requireAuth, addBookmarkToTag);
router.delete("/tags/:id/bookmarks/:bookmarkId", requireAuth, removeBookmarkFromTag);



export default router;