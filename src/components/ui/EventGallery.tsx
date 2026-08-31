"use client";

import { useEffect, useState } from "react";
import { eventDetails } from "@/data/event";
import { t } from "@/locales";
import styles from "./EventGallery.module.css";

interface GalleryPhoto {
  id: string;
  name: string;
  url: string;
}

export function EventGallery() {
  const folderId = eventDetails.postEvent.galleryFolderId;
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  useEffect(() => {
    if (!folderId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

    async function fetchPhotos() {
      try {
        const res = await fetch(
          `${apiUrl}/api/gallery?folderId=${encodeURIComponent(folderId)}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.photos) {
            setPhotos(data.data.photos);
          }
        }
      } catch {
        /* graceful: show nothing */
      }
    }

    fetchPhotos();
  }, [folderId]);

  if (!folderId || photos.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t("closed.galleryHeading")}</h2>
      <div className={styles.grid}>
        {photos.map((photo) => (
          <div key={photo.id} className={styles.item}>
            <img
              src={photo.url}
              alt={photo.name}
              loading="lazy"
              className={styles.image}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
