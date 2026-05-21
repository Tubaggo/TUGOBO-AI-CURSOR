-- Manychat bridge configuration readiness.
-- Sensitive credentials stay server-side in connected_channels/env config.

ALTER TABLE connected_channels
  ADD COLUMN IF NOT EXISTS inbound_secret text,
  ADD COLUMN IF NOT EXISTS outbound_token text,
  ADD COLUMN IF NOT EXISTS outbound_url text,
  ADD COLUMN IF NOT EXISTS external_account_id text;

UPDATE connected_channels
SET inbound_secret = secret
WHERE provider = 'manychat'
  AND inbound_secret IS NULL
  AND secret IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_connected_channels_manychat_account
  ON connected_channels (hotel_id, provider, channel_type, external_account_id)
  WHERE provider = 'manychat';
