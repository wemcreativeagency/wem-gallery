"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

interface Props {
  galleryUrl: string;
  gallerySlug: string;
}

export default function SharePanel({ galleryUrl }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(galleryUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 bg-wem-bg border border-wem-border rounded-lg px-3 py-2">
      <Share2 size={14} className="text-wem-gray flex-shrink-0" />
      <span className="text-xs text-wem-gray truncate max-w-[180px]">{galleryUrl}</span>
      <button
        onClick={copy}
        className="flex-shrink-0 text-wem-gray hover:text-wem-red transition"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
