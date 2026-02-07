-- Enable Realtime + RLS for Message table
-- Run this SQL in your Supabase SQL Editor

-- 1) Ensure Message table is added to realtime publication
-- Skip if already added
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'Message'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE "Message";
  END IF;
END$$;

-- 2) Verify publication
SELECT * FROM pg_catalog.pg_publication_tables WHERE tablename = 'Message';

-- 3) Enable RLS (required for secure realtime payloads)
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

-- 4) Allow participants to SELECT messages in their conversations
DROP POLICY IF EXISTS "Message select by participants" ON "Message";
CREATE POLICY "Message select by participants"
ON "Message"
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM "Conversation" c
    WHERE c.id = "Message"."conversationId"
      AND EXISTS (
        SELECT 1
        FROM "Student" s
        WHERE s."userId" = auth.uid()::text
          AND (s.id = c."studentAId" OR s.id = c."studentBId")
      )
  )
);

-- 5) Allow sender to INSERT messages in conversations they belong to
DROP POLICY IF EXISTS "Message insert by sender" ON "Message";
CREATE POLICY "Message insert by sender"
ON "Message"
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Student" s
    WHERE s."userId" = auth.uid()::text
      AND s.id = "Message"."senderId"
  )
  AND EXISTS (
    SELECT 1
    FROM "Conversation" c
    WHERE c.id = "Message"."conversationId"
      AND EXISTS (
        SELECT 1
        FROM "Student" s
        WHERE s."userId" = auth.uid()::text
          AND (s.id = c."studentAId" OR s.id = c."studentBId")
      )
  )
);
