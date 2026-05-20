# Manychat Inbound Local Testing

## 1. Fast Local Test

In local development, this payload now works without a real Manychat hotel/channel record:

- `hotel_id = "demo-hotel"`
- `secret = "test-secret"`

If live ops is configured, the webhook safely bridges into the existing demo conversation ingestion flow.
If live ops is not configured, the webhook returns a mock success payload instead of throwing a server error.

## 2. Example Payload

Use [manychat-inbound.payload.json](/c:/Users/GÖKHAN/Desktop/TUGOBO-AI-CURSOR%20-%2018%20MAYIS%202026/apps/web/examples/manychat-inbound.payload.json).

## 3. Sample curl

```bash
curl -X POST http://localhost:3000/api/integrations/manychat/inbound \
  -H "Content-Type: application/json" \
  --data @apps/web/examples/manychat-inbound.payload.json
```

## 4. Expected Result

- Response is `200` with `success: true`.
- In development, `demo-hotel` never requires a real Manychat DB row.
- If live ops is configured, a conversation is created or reused through the existing ingestion backbone.
- If live ops is not configured, the endpoint still returns a safe mock success response.

## 5. Real Integration Validation

For non-demo payloads, the target hotel and channel must exist in the database:

- `hotels.id = <hotel_id>`
- `connected_channels.provider = "manychat"`
- `connected_channels.channel_type = "instagram"` or `whatsapp`
- `connected_channels.status = "connected"`
- `connected_channels.secret = "<your-shared-secret>"`
