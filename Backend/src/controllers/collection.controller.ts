import type { Request, Response } from "express";
import prisma from "../db.js";

export const createCollection = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Collection name is required" });
  }

  try {
    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        userId: req.user.id,
      },
    });

    return res.status(201).json(collection);
  } catch (error) {
    console.error("Failed to create collection", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getCollections = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const collections = await prisma.collection.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { bookmarks: true },
        },
      },
    });

    return res.status(200).json({ collections });
  } catch (error) {
    console.error("Failed to fetch collections", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateCollection = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const { name } = req.body;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Collection ID is required",
    });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Collection name is required" });
  }

  try {
    const collection = await prisma.collection.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: { name: name.trim() },
    });

    return res.status(200).json(updatedCollection);
  } catch (error) {
    console.error(`Failed to update collection ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteCollection = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Collection ID is required",
    });
  }

  try {
    const collection = await prisma.collection.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }

    await prisma.collection.delete({
      where: { id },
    });

    return res.status(200).json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error(`Failed to delete collection ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
