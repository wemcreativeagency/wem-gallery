-- We.m Gallery — Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- TABLES
-- ─────────────────────────────────────────

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'password')),
  password TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  width INT,
  height INT,
  duration_seconds FLOAT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, client_id),
  UNIQUE(media_id, session_id)
);

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(media_id, client_id),
  UNIQUE(media_id, session_id)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id TEXT,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'comment' CHECK (type IN ('comment', 'suggestion', 'validation')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE selections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  session_id TEXT,
  media_ids UUID[] NOT NULL DEFAULT '{}',
  message TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────

CREATE VIEW media_with_counts AS
SELECT
  m.*,
  COUNT(DISTINCT l.id) AS like_count,
  COUNT(DISTINCT f.id) AS favorite_count
FROM media m
LEFT JOIN likes l ON l.media_id = m.id
LEFT JOIN favorites f ON f.media_id = m.id
GROUP BY m.id;

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────

CREATE INDEX idx_galleries_slug ON galleries(slug);
CREATE INDEX idx_media_gallery_id ON media(gallery_id);
CREATE INDEX idx_likes_media_id ON likes(media_id);
CREATE INDEX idx_favorites_media_id ON favorites(media_id);
CREATE INDEX idx_comments_media_id ON comments(media_id);

-- ─────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER galleries_updated_at
  BEFORE UPDATE ON galleries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;

-- Admins (authenticated users = We.m team) can do everything
CREATE POLICY "Admin full access on clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on galleries" ON galleries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on media" ON media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on likes" ON likes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on favorites" ON favorites FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on comments" ON comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access on selections" ON selections FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public (clients) can read public/private galleries (password handled in app)
CREATE POLICY "Public can read galleries" ON galleries FOR SELECT TO anon USING (true);
CREATE POLICY "Public can read media" ON media FOR SELECT TO anon USING (true);

-- Clients can write likes, favorites, comments, selections (anon)
CREATE POLICY "Anon can insert likes" ON likes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can delete own likes" ON likes FOR DELETE TO anon USING (session_id IS NOT NULL);
CREATE POLICY "Anon can read likes" ON likes FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert favorites" ON favorites FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can delete own favorites" ON favorites FOR DELETE TO anon USING (session_id IS NOT NULL);
CREATE POLICY "Anon can read favorites" ON favorites FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert comments" ON comments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read comments" ON comments FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert selections" ON selections FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read own selections" ON selections FOR SELECT TO anon USING (true);
