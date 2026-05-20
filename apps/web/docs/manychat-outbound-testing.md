# Manychat Outbound Local Testing

This endpoint sends operator-approved replies back through the outbound provider bridge.

Local development is safe by default. If real Manychat outbound bridge credentials are not configured, the service returns `mock_sent` instead of crashing.

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
- `mockMode = true` when real outbound credentials are missing

## Optional Real Bridge Env

```bash
MANYCHAT_OUTBOUND_API_URL=https://your-bridge.example.com/manychat/outbound
MANYCHAT_OUTBOUND_API_TOKEN=your-server-token
MANYCHAT_OUTBOUND_INTERNAL_TOKEN=your-internal-route-token
```
