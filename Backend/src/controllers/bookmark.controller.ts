import { URL } from "node:url";
import type { Request, Response } from "express";
import prisma from "../db.js";

const validateUrl = (url: unknown): { isValid: boolean; error?: string } => {
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

    return { isValid: true };
  } catch {
    return { isValid: false, error: "url is not valid" };
  }
};

const fetchMetadata = async (bookmarkId: string, url: string) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();

    console.log(`Fetched ${html.length} characters from ${url}`);

    await prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
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
  const { url } = req.body;

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
        userId: req.user.id,
        metadataStatus: "PENDING",
      },
    });

    
    fetchMetadata(bookmark.id, bookmark.url);

    return res.status(201).json(bookmark);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
