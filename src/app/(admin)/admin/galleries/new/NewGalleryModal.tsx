"use client";

import { useRouter } from "next/navigation";

export default function NewGalleryModal({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 pt-16 px-4"
      onClick={() => router.back()}
    >
      <div
        className="w-full max-w-lg bg-wem-bg border border-wem-border rounded-2xl p-8 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
