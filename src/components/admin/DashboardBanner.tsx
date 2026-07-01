"use client";

import { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_BANNER = "/studio.jpg";

export default function DashboardBanner() {
  const [bannerUrl, setBannerUrl] = useState<string>(DEFAULT_BANNER);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadBanner() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const saved = user?.user_metadata?.dashboard_banner;
      if (saved) setBannerUrl(saved);
    }
    loadBanner();
  }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop();
      const path = `settings/dashboard-banner.${ext}`;

      await supabase.storage.from("gallery-logos").upload(path, file, { upsert: true });
      const { data } = supabase.storage.from("gallery-logos").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.auth.updateUser({ data: { dashboard_banner: url } });
      setBannerUrl(url);
    } catch (err) {
      console.error("Erreur upload bannière", err);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-8 group">
      <img
        src={bannerUrl}
        alt="Bannière"
        className="w-full h-full object-cover"
        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_BANNER; }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/40" />

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100 backdrop-blur-sm"
      >
        <Camera size={13} />
        {uploading ? "Upload…" : "Changer la photo"}
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}
