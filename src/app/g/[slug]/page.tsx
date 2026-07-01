import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import GalleryView from "@/components/gallery/GalleryView";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: gallery } = await supabase
    .from("galleries")
    .select("name, description")
    .eq("slug", slug)
    .single();

  return {
    title: gallery ? `${gallery.name} — We.m Gallery` : "We.m Gallery",
    description: gallery?.description ?? "Galerie partagée par We.m Creative Agency",
  };
}

export default async function GalleryPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select(`
      *,
      client:clients(name),
      media(*)
    `)
    .eq("slug", slug)
    .single();

  if (!gallery) notFound();

  // Sort media by sort_order
  if (gallery.media) {
    gallery.media.sort((a: any, b: any) => a.sort_order - b.sort_order);
  }

  return <GalleryView gallery={gallery as any} />;
}
