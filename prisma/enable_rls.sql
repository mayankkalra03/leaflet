-- Enable Row Level Security (RLS) on all Leaflet database tables in Supabase

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReadingProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Annotation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bookmark" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Sticker" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ReadingSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserPreference" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow server access" ON "User";
DROP POLICY IF EXISTS "Allow server access" ON "Book";
DROP POLICY IF EXISTS "Allow server access" ON "ReadingProgress";
DROP POLICY IF EXISTS "Allow server access" ON "Annotation";
DROP POLICY IF EXISTS "Allow server access" ON "Bookmark";
DROP POLICY IF EXISTS "Allow server access" ON "Sticker";
DROP POLICY IF EXISTS "Allow server access" ON "ReadingSession";
DROP POLICY IF EXISTS "Allow server access" ON "UserPreference";

DROP POLICY IF EXISTS "Public SELECT access" ON "User";
DROP POLICY IF EXISTS "Public SELECT access" ON "Book";
DROP POLICY IF EXISTS "Public SELECT access" ON "ReadingProgress";
DROP POLICY IF EXISTS "Public SELECT access" ON "Annotation";
DROP POLICY IF EXISTS "Public SELECT access" ON "Bookmark";
DROP POLICY IF EXISTS "Public SELECT access" ON "Sticker";
DROP POLICY IF EXISTS "Public SELECT access" ON "ReadingSession";
DROP POLICY IF EXISTS "Public SELECT access" ON "UserPreference";

CREATE POLICY "Public SELECT access" ON "User" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "Book" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "ReadingProgress" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "Annotation" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "Bookmark" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "Sticker" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "ReadingSession" FOR SELECT USING (true);
CREATE POLICY "Public SELECT access" ON "UserPreference" FOR SELECT USING (true);
