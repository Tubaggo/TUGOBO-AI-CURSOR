-- Sprint 23: live operational infrastructure
-- Apply via Supabase SQL editor or drizzle-kit push when DATABASE_URL is configured.

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS panel_channel text NOT NULL DEFAULT 'web_chat',
  ADD COLUMN IF NOT EXISTS external_session_id text,
  ADD COLUMN IF NOT EXISTS unread_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS escalation_state text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS reservation_state text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS payment_state text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS operator_joined_at timestamptz;

ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'guest',
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS ai_generated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS human_override boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  contact_id uuid NOT NULL REFERENCES contacts(id),
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending_payment',
  ref text,
  room_type text,
  check_in timestamptz,
  check_out timestamptz,
  guest_count integer,
  total_amount numeric(12, 2),
  currency text DEFAULT 'TRY',
  timeline jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  auth_user_id uuid,
  display_name text NOT NULL,
  email text,
  role text NOT NULL DEFAULT 'staff',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS operational_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  label text NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'active',
  reason text,
  assignee_id uuid REFERENCES operators(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_hotel_last_message
  ON conversations (hotel_id, last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_conversations_external_session
  ON conversations (hotel_id, external_session_id)
  WHERE external_session_id IS NOT NULL;

-- Enable Supabase Realtime (run in Supabase dashboard if not using publication API)
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
