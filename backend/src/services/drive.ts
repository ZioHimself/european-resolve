import { google, type drive_v3 } from "googleapis";
import sharp from "sharp";
import { Readable } from "node:stream";
import { config } from "../config.js";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
];

export class DriveService {
  private drive: drive_v3.Drive;

  constructor() {
    const { clientId, clientSecret, refreshToken } = config.driveOAuth;

    if (clientId && clientSecret && refreshToken) {
      const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
      oauth2.setCredentials({ refresh_token: refreshToken });
      this.drive = google.drive({ version: "v3", auth: oauth2 });
    } else {
      const auth = new google.auth.GoogleAuth({ scopes: SCOPES });
      this.drive = google.drive({ version: "v3", auth });
    }
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
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  async listGalleryPhotos(folderId: string): Promise<{ id: string; name: string; url: string }[]> {
    if (!folderId) return [];

    const res = await this.drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`,
      fields: "files(id, name)",
      orderBy: "name",
      pageSize: 50,
    });

    return (res.data.files ?? []).map((f) => ({
      id: f.id!,
      name: f.name ?? "photo",
      url: this.getPhotoUrl(f.id!),
    }));
  }
}
