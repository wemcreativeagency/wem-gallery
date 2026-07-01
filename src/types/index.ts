export type MediaType = "image" | "video" | "document" | "audio";
export type GalleryVisibility = "public" | "private" | "password";
export type CommentType = "comment" | "suggestion" | "validation";

export interface Client {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface Gallery {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image: string | null;
  client_id: string | null;
  visibility: GalleryVisibility;
  password: string | null;
  expires_at: string | null;
  download_enabled: boolean;
  created_at: string;
  updated_at: string;
  client?: Client;
  media?: Media[];
  _count?: {
    media: number;
    favorites: number;
  };
}

export interface Media {
  id: string;
  gallery_id: string;
  type: MediaType;
  url: string;
  thumbnail_url: string | null;
  filename: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  sort_order: number;
  created_at: string;
  like_count?: number;
  favorite_count?: number;
  is_liked?: boolean;
  is_favorited?: boolean;
}

export interface Like {
  id: string;
  media_id: string;
  client_id: string | null;
  session_id: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  media_id: string;
  client_id: string | null;
  session_id: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  media_id: string;
  client_id: string | null;
  session_id: string | null;
  content: string;
  type: CommentType;
  created_at: string;
}

export interface Selection {
  id: string;
  gallery_id: string;
  client_id: string | null;
  session_id: string | null;
  media_ids: string[];
  message: string | null;
  sent_at: string;
}

export interface DashboardStats {
  galleries: number;
  photos: number;
  videos: number;
  clients: number;
  favorites: number;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
}
