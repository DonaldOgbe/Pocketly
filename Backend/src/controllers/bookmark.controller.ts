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
        domain: validation.domain,
        userId: req.user.id,
        metadataStatus: "PENDING",
      },
    });

    // Deliberately not awaited so the save returns immediately, but an
    // unhandled rejection here would take the whole process down.
    fetchMetadata(bookmark.id, bookmark.url).catch((error) => {
      console.error(`Metadata update failed for bookmark ${bookmark.id}`, error);
    });

    return res.status(201).json(bookmark);
  } catch (error) {
    console.error(error);

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
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? requestedPage : 1;
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
    page
  })
};
