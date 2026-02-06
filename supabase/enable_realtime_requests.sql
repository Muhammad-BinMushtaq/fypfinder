-- Enable Realtime for Request table
-- Run this SQL in your Supabase SQL Editor

-- 1. First, check if the Request table has replication enabled
-- Run this to see current publication tables:
SELECT * FROM pg_catalog.pg_publication_tables;

-- 2. Enable Realtime on the Request table
-- Add the Request table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE "Request";

-- 2b. Enable Realtime on the Message table (chat messages)
ALTER PUBLICATION supabase_realtime ADD TABLE "Message";

-- 3. Verify it was added
SELECT * FROM pg_catalog.pg_publication_tables WHERE tablename = 'Request';
SELECT * FROM pg_catalog.pg_publication_tables WHERE tablename = 'Message';

-- If you see the Request table in the output, realtime is now enabled!

-- Note: You may also need to ensure your Supabase project has Realtime enabled.
-- Go to Supabase Dashboard > Project Settings > API > Realtime and make sure it's enabled.
