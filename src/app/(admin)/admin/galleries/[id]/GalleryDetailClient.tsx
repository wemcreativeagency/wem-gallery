"use client";

import { useState } from "react";
import { Media } from "@/types";
import UploadZone from "@/components/admin/UploadZone";
import AdminMediaGrid from "@/components/admin/AdminMediaGrid";

interface Props {
  galleryId: string;
  gallerySlug: string;
  initialMedia: Media[];
}

export default function GalleryDetailClient({ galleryId, gallerySlug, initialMedia }: Props) {
  const [media, setMedia] = useState<Media[]>(initialMedia);

  function onUploadComplete(newMedia: Media) {
    setMedia((prev) => [newMedia, ...prev]);
  }

  function onDelete(id: string) {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <>
      <UploadZone galleryId={galleryId} gallerySlug={gallerySlug} onUploadComplete={onUploadComplete} />
      <div className="mt-8">
        <AdminMediaGrid media={media} galleryId={galleryId} onDelete={onDelete} />
      </div>
    </>
  );
}
