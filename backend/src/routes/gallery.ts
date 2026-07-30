import { Hono } from "hono";
import { DriveService } from "../services/drive.js";
import { config } from "../config.js";

export const galleryRoute = new Hono();

const driveService = new DriveService();

galleryRoute.get("/", async (c) => {
  const photos = await driveService.listGalleryPhotos(config.galleryFolderId);

  c.header("Cache-Control", "public, max-age=3600");

  return c.json({ success: true, data: { photos } });
});
