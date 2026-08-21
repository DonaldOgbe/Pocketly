import { URL } from "node:url";
import type { Request, Response } from "express";
import prisma from "../db.js";
import { getMetadata } from "../services/metadata.service.js";

type UrlValidation =
  | { isValid: true; domain: string }
  | { isValid: false; error: string };

const validateUrl = (url: unknown): UrlValidation => {
  if (typeof url !== "string" || !url.trim()) {
    return { isValid: false, error: "url is required" };
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return {
        isValid: false,
        error: "url must use http or https",
      };
    }

    return { isValid: true, domain: parsedUrl.hostname };
  } catch {
    return { isValid: false, error: "url is not valid" };
  }
};

const fetchMetadata = async (bookmarkId: string, url: string) => {
  try {
    const metadata = await getMetadata(url);

    await prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        title: metadata.title,
        description: metadata.description,
        thumbnail: metadata.thumbnail,
        favicon: metadata.favicon,
        metadataStatus: "SUCCESS",
      },
    });
  } catch (error) {
    console.error(`Failed to fetch metadata for ${url}`, error);

    await prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        metadataStatus: "FAILED",
      },
    });
  }
};

export const saveBookmark = async (req: Request, res: Response) => {
  const { url, isFavorite } = req.body;

  const validation = validateUrl(url);

  if (!validation.isValid) {
    return res.status(400).json({
      error: validation.error,
    });
  }

  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        domain: validation.domain,
        userId: req.user.id,
        metadataStatus: "PENDING",
        isFavorite: typeof isFavorite === "boolean" ? isFavorite : false,
      },
    });

    fetchMetadata(bookmark.id, bookmark.url).catch((error) => {
      console.error(
        `Metadata update failed for bookmark ${bookmark.id}`,
        error,
      );
    });

    return res.status(201).json(bookmark);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const toggleFavorite = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Bookmark ID is required",
    });
  }

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        error: "Bookmark not found",
      });
    }

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        isFavorite: !bookmark.isFavorite,
      },
    });

    return res.status(200).json(updatedBookmark);
  } catch (error) {
    console.error(`Failed to toggle favorite for bookmark ${id}`, error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getBookmark = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  // pagination limit of 10
  const requestedPage = parseInt(req.query.page as string, 10);
  const page =
    Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user.id },
    orderBy: { savedAt: "desc" },
    skip,
    take: limit,
  });

  res.status(200).json({
    bookmarks,
    page,
  });
};

export const updateBookmark = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Bookmark ID is required" });
  }

  const { title, description, isFavorite, isRead } = req.body;

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (typeof title === "string") dataToUpdate.title = title;
    if (typeof description === "string") dataToUpdate.description = description;

    if (isFavorite !== undefined) {
      dataToUpdate.isFavorite = isFavorite === true || isFavorite === "true";
    }

    if (isRead !== undefined) {
      const readBool = isRead === true || isRead === "true";
      dataToUpdate.isRead = readBool;
      dataToUpdate.readAt = readBool ? new Date() : null;
    }

    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.status(200).json(updatedBookmark);
  } catch (error) {
    console.error(`Failed to update bookmark ${id}`, error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteBookmark = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  const { id } = req.params;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error: "Bookmark ID is required",
    });
  }

  try {
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        error: "Bookmark not found",
      });
    }

    await prisma.bookmark.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Bookmark deleted successfully",
    });
  } catch (error) {
    console.error(`Failed to delete bookmark ${id}`, error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
