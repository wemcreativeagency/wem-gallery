import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMediaKey, getPublicUrl, getUploadUrl } from "@/lib/r2/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { galleryId, gallerySlug, filename, contentType, size } = await req.json();

  const key = getMediaKey(gallerySlug, filename);
  const publicUrl = getPublicUrl(key);
  const uploadUrl = await getUploadUrl(key, contentType);

  const isVideo = contentType.startsWith("video/");

  const { data: media } = await supabase
    .from("media")
    .insert({
      gallery_id: galleryId,
      type: isVideo ? "video" : "image",
      url: publicUrl,
      thumbnail_url: isVideo ? null : publicUrl,
      filename,
      size_bytes: size,
    })
    .select()
    .single();

  return NextResponse.json({ uploadUrl, publicUrl, key, mediaId: media?.id });
}
