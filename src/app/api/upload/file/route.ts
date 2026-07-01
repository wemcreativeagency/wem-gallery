import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;
export const runtime = "nodejs";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File;
    const galleryId = form.get("galleryId") as string;
    const gallerySlug = form.get("gallerySlug") as string;

    if (!file || !galleryId || !gallerySlug) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    console.log(`[upload] file=${file.name} size=${file.size} type=${file.type} bucket=${BUCKET} account=${process.env.R2_ACCOUNT_ID?.slice(0,8)}...`);

    const ext = file.name.split(".").pop();
    const key = `galleries/${gallerySlug}/${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log(`[upload] uploading to R2 key=${key}`);

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    console.log(`[upload] R2 upload OK`);

    const publicUrl = `${PUBLIC_URL}/${key}`;
    const isVideo = file.type.startsWith("video/");
    const isDocument = !isVideo && !file.type.startsWith("image/");

    const { data: media, error: dbError } = await supabase.from("media").insert({
      gallery_id: galleryId,
      type: isVideo ? "video" : isDocument ? "document" : "image",
      url: publicUrl,
      thumbnail_url: isVideo || isDocument ? null : publicUrl,
      filename: file.name,
      size_bytes: file.size,
    }).select().single();

    if (dbError) console.error("[upload] Supabase error:", dbError);
    console.log(`[upload] done mediaId=${media?.id} url=${publicUrl}`);

    return NextResponse.json({
      publicUrl,
      mediaId: media?.id,
      type: isVideo ? "video" : isDocument ? "document" : "image",
    });
  } catch (err) {
    console.error("[upload] ERROR:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
