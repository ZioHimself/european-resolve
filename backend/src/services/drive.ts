import { google, type drive_v3 } from "googleapis";
import sharp from "sharp";
import { Readable } from "node:stream";
import { config } from "../config.js";

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

export class DriveService {
  private drive: drive_v3.Drive;

  constructor() {
    const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
    this.drive = google.drive({ version: "v3", auth });
  }

  async uploadPhoto(buffer: Buffer, filename: string): Promise<string> {
    const resized = await sharp(buffer)
      .resize(400, 400, { fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    const stream = Readable.from(resized);

    const res = await this.drive.files.create({
      requestBody: {
        name: filename.replace(/\.[^.]+$/, ".webp"),
        parents: [config.googleDriveFolderId],
      },
      media: {
        mimeType: "image/webp",
        body: stream,
      },
      fields: "id",
    });

    const fileId = res.data.id!;

    await this.drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });

    return fileId;
  }

  getPhotoUrl(fileId: string): string {
    return `https://drive.google.com/uc?id=${fileId}&export=view`;
  }
}
