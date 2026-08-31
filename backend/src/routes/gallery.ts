import { Hono } from "hono";
import { DriveService } from "../services/drive.js";
import { config } from "../config.js";

export const galleryRoute = new Hono();

const driveService = new DriveService();

const FOLDER_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

function resolveFolderId(requested?: string): string {
  const candidate = requested?.trim() || config.galleryFolderId;
  if (!candidate || !FOLDER_ID_PATTERN.test(candidate)) {
    return "";
  }
  return candidate;
}

galleryRoute.get("/", async (c) => {
  const folderId = resolveFolderId(c.req.query("folderId"));
  const photos = await driveService.listGalleryPhotos(folderId);

  c.header("Cache-Control", "public, max-age=3600");

  return c.json({ success: true, data: { photos } });
});
