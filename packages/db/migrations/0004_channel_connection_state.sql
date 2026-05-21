-- Channel connection state foundation.
-- Adds health metadata without exposing provider credentials to clients.

ALTER TABLE connected_channels
  ALTER COLUMN status SET DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS last_connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text;

UPDATE connected_channels
SET status = CASE status
  WHEN 'connected' THEN 'active'
  WHEN 'disconnected' THEN 'disabled'
  WHEN 'draft' THEN 'pending'
  ELSE status
END
WHERE status IN ('connected', 'disconnected', 'draft');

UPDATE connected_channels
SET last_connected_at = created_at
WHERE status = 'active'
  AND last_connected_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_connected_channels_hotel_status
  ON connected_channels (hotel_id, status, channel_type);
