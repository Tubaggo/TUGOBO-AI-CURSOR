# Tugobo AI

Tugobo AI, oteller için AI destekli dijital otel operasyon merkezidir.

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment

```bash
cp .env.example apps/web/.env.local
```

`apps/web/.env.local` dosyasını gerçek anahtarlarınızla doldurun.

### 3. Set up Supabase

1. [supabase.com](https://supabase.com) üzerinden proje oluşturun.
2. Project Settings > API altından `Project URL` ve `anon key` değerlerini alın.
3. Project Settings > Database > Connection string altından direct connection string alın.
4. Bu değerleri `apps/web/.env.local` içine ekleyin.

### 4. Set up Twilio WhatsApp

1. [twilio.com](https://twilio.com) hesabı oluşturun.
2. Messaging > Try it out > Send a WhatsApp message adımlarını izleyin.
3. Console Dashboard üzerinden `Account SID` ve `Auth Token` değerlerini alın.
4. Sandbox kullanıyorsanız `TWILIO_WHATSAPP_NUMBER=+14155238886` ekleyin.

### 5. Configure webhook URL

Yerelde geliştirme için bir public URL gerekir:

```bash
ngrok http 3000
```

Ardından:

```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

Twilio webhook adresi:

```text
https://abc123.ngrok-free.app/api/webhooks/twilio
```

### 6. Add AI keys

```env
OPENAI_API_KEY=sk-...
DEEPSEEK_API_KEY=
```

### 7. Run the app

```bash
pnpm dev
```

Landing için `http://localhost:3000`, panel için ilgili uygulama rotalarını açın.

### 8. Verify the main flow

1. WhatsApp veya web üzerinden bir misafir mesajı gönderin.
2. AI yanıtının geldiğini doğrulayın.
3. Rezervasyon niyeti, teklif/ödeme ve onay akışının panelde göründüğünü kontrol edin.
4. Gerekirse insan destek devralma akışını test edin.

## Release checks

```bash
pnpm.cmd --filter web type-check
pnpm.cmd lint
pnpm.cmd build
```

## Production deployment

Deployment steps, required environment variables, domain setup, and Supabase notes are documented in `DEPLOYMENT.md`.

## Deployment notes

- `tugobo.com`: landing
- `app.tugobo.com`: operator panel
- Production ortamında `NEXT_PUBLIC_APP_URL=https://app.tugobo.com` kullanın.
- Twilio webhook adresini `https://app.tugobo.com/api/webhooks/twilio` olarak güncelleyin.

## Database commands

```bash
pnpm db:push
pnpm db:migrate
```

## Project structure

```text
tugobo-ai/
|- apps/web/            # Next.js 15 landing + operator panel + API
|- packages/shared/     # Types, logger, env
|- packages/db/         # Drizzle schema + client
|- packages/channels/   # Kanal adaptörleri
|- packages/core/       # Agents, tools, Inngest workflows, prompts
|- supabase/            # Drizzle migrations
|- .cursor/             # Internal docs
|- .env.example
`- AGENTS.md
```
