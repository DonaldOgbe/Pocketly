import type { Request, Response } from "express";
import prisma from "../db.js";

export const createTag = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Tag name is required" });
  }

  const tagName = name.trim().toLowerCase();

  try {
    const existingTag = await prisma.tag.findUnique({
      where: {
        userId_name: {
          userId: req.user.id,
          name: tagName,
        },
      },
    });

    if (existingTag) {
      return res.status(409).json({ error: "Tag already exists" });
    }

    const tag = await prisma.tag.create({
      data: {
        name: tagName,
        userId: req.user.id,
      },
    });

    return res.status(201).json(tag);
  } catch (error) {
    console.error("Failed to create tag", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTags = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const tags = await prisma.tag.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    return res.status(200).json({ tags });
  } catch (error) {
    console.error("Failed to fetch tags", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { name } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Tag ID is required" });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Tag name is required" });
  }

  const tagName = name.trim().toLowerCase();

  try {
    const tag = await prisma.tag.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: { name: tagName },
    });

    return res.status(200).json(updatedTag);
  } catch (error) {
    console.error(`Failed to update tag ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Tag ID is required" });
  }

  try {
    const tag = await prisma.tag.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    await prisma.tag.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error(`Failed to delete tag ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const addBookmarkToTag = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { bookmarkId } = req.body;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Tag ID is required" });
  }

  if (typeof bookmarkId !== "string" || !bookmarkId.trim()) {
    return res.status(400).json({ error: "Bookmark ID is required" });
  }

  try {
    const [tag, bookmark] = await Promise.all([
      prisma.tag.findFirst({ where: { id, userId: req.user.id } }),
      prisma.bookmark.findFirst({ where: { id: bookmarkId, userId: req.user.id } }),
    ]);

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    await prisma.tag.update({
      where: { id },
      data: { bookmarks: { connect: { id: bookmarkId } } },
    });

    return res.status(204).end();
  } catch (error) {
    console.error(`Failed to add bookmark ${bookmarkId} to tag ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const removeBookmarkFromTag = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id, bookmarkId } = req.params;

  if (typeof id !== "string" || typeof bookmarkId !== "string") {
    return res.status(400).json({ error: "Tag ID and bookmark ID are required" });
  }

  try {
    const tag = await prisma.tag.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    await prisma.tag.update({
      where: { id },
      data: { bookmarks: { disconnect: { id: bookmarkId } } },
    });

    return res.status(204).end();
  } catch (error) {
    console.error(`Failed to remove bookmark ${bookmarkId} from tag ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};