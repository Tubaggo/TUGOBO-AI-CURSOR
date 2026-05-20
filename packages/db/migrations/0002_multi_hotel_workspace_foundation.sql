-- Multi-hotel workspace foundation
-- Adds hotel workspace fields, connected channel normalization,
-- and tenant-aware conversation/message columns without touching UI layouts.

ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter';

UPDATE hotels
SET slug = lower(regexp_replace(coalesce(name, 'hotel') || '-' || left(id::text, 8), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

ALTER TABLE hotels
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_hotels_slug
  ON hotels (slug);

CREATE TABLE IF NOT EXISTS connected_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  provider text NOT NULL,
  channel_type text NOT NULL,
  status text NOT NULL DEFAULT 'connected',
  secret text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  external_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO connected_channels (
  id,
  hotel_id,
  provider,
  channel_type,
  status,
  metadata,
  external_address,
  created_at
)
SELECT
  id,
  hotel_id,
  CASE
    WHEN type = 'whatsapp_meta' THEN 'whatsapp_cloud'
    ELSE 'whatsapp_twilio'
  END,
  CASE
    WHEN config ->> 'panelChannel' = 'instagram' THEN 'instagram'
    WHEN config ->> 'panelChannel' = 'web_chat' THEN 'web_chat'
    ELSE 'whatsapp'
  END,
  CASE
    WHEN coalesce(is_active, true) THEN 'connected'
    ELSE 'disconnected'
  END,
  coalesce(config, '{}'::jsonb),
  phone_number,
  created_at
FROM channels
ON CONFLICT (id) DO NOTHING;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS connected_channel_id uuid REFERENCES connected_channels(id),
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'web_chat',
  ADD COLUMN IF NOT EXISTS assigned_operator uuid;

UPDATE conversations
SET connected_channel_id = channel_id
WHERE connected_channel_id IS NULL
  AND channel_id IS NOT NULL;

UPDATE conversations
SET channel = coalesce(panel_channel, 'web_chat')
WHERE channel IS NULL
   OR channel = 'web_chat';

UPDATE conversations
SET assigned_operator = assignee_id
WHERE assigned_operator IS NULL
  AND assignee_id IS NOT NULL;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS sender_type text NOT NULL DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS external_message_id text;

UPDATE messages
SET
  sender_type = coalesce(role, 'guest'),
  content = coalesce(content, body),
  external_message_id = coalesce(external_message_id, external_id)
WHERE content IS NULL
   OR external_message_id IS NULL
   OR sender_type IS NULL;

ALTER TABLE messages
  ALTER COLUMN content SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_connected_channels_hotel_type
  ON connected_channels (hotel_id, channel_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_hotel_channel_last_message
  ON conversations (hotel_id, channel, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_provider_created
  ON messages (conversation_id, provider, created_at DESC);
