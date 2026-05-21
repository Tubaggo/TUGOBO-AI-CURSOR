# Manychat Outbound Local Testing

This endpoint sends operator-approved replies back through the outbound provider bridge.

Local development is safe by default. `demo-hotel` returns `mock_sent` unless real bridge config is present and mock mode is off.

## Endpoint

`POST /api/integrations/manychat/outbound`

## Required Payload

- `hotel_id`
- `conversation_id`
- `external_user_id`
- `channel`
- `message`
- `secret` or `internal_auth_token`

## PowerShell Example

```powershell
$body = @{
  hotel_id = "demo-hotel"
  conversation_id = "demo-manychat-instagram-ig_123"
  external_user_id = "ig_123"
  channel = "instagram"
  message = "Merhaba, talebinizi aldık. Size hemen yardımcı oluyorum."
  secret = "test-secret"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:3000/api/integrations/manychat/outbound" `
  -ContentType "application/json" `
  -Body $body
```

## Expected Result

- `success = true`
- `provider = "manychat"`
- `deliveryStatus = "sent"` or `"mock_sent"`
- `mockMode = true` for local mock delivery

## Real Bridge Expectations

```bash
MANYCHAT_BRIDGE_OUTBOUND_URL=https://your-bridge.example.com/manychat/outbound
MANYCHAT_BRIDGE_TOKEN=your-server-token
MANYCHAT_BRIDGE_SECRET=your-shared-inbound-secret
MANYCHAT_OUTBOUND_INTERNAL_TOKEN=your-internal-route-token
```

The outbound bridge receives a server-to-server `POST` with:

- `Authorization: Bearer <MANYCHAT_BRIDGE_TOKEN or connected_channels.outbound_token>`
- `hotel_id`
- `conversation_id`
- `external_user_id`
- `channel`
- `message`
- `metadata`

Missing live outbound config returns clean JSON with `error = "manychat_bridge_config_missing"`.
