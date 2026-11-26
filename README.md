# Blinkport

Blinkport is a lightweight temporary sharing web app for text, code snippets, and small files up to 5 MB across devices.

## What it includes

- Paste creation for text notes, code snippets, and file drops
- Public detail pages with line numbers for typical pastes and bounded rendering for large pastes
- 6-digit access codes for opening a share on another device
- QR code access for instant opening on another device
- Automatic expiry after 10 minutes for shares and uploaded files
- Per-client rate limits for share creation and access-code lookup
- Bounded request-body parsing before upload/content validation
- Safe attachment downloads with `attachment` response headers
- In-memory temporary storage during local development
- Redis-backed temporary storage in production, with atomic access-code reservation and expiring keys
- Responsive editorial-style UI built with Next.js App Router
- Marketing, help, contact, privacy, and terms pages for a more production-ready public site
- Sitemap, robots, Open Graph image, manifest, and JSON-LD metadata for stronger SEO foundations
- `noindex` handling on thin utility paste pages so search focus stays on higher-value public pages

## Tech stack

- Next.js
- React
- TypeScript
- Upstash Redis REST API for production share storage

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Run the storage and rate-limit regression tests with `npm run test`.

The supported Node.js runtime is 20.9 or newer. Production builds automatically validate the public site URL, support contact, company name, and proxy-hop setting. Run `npm run launch:check` after setting all production values in `.env.local` or in your hosting environment; it also verifies Redis connectivity without printing secret values. `npm start` validates the production settings before starting the server.

## Environment variables

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.example
NEXT_PUBLIC_SUPPORT_EMAIL=support@your-domain.example
NEXT_PUBLIC_COMPANY_NAME=Your Company Name
TRUSTED_PROXY_HOPS=1
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-rest-token
```

Set the public site and contact values before launch. Production requires an Upstash Redis REST URL and token; without them, storage requests fail closed instead of falling back to per-instance memory. Set `TRUSTED_PROXY_HOPS` to the number of trusted proxies that append to `X-Forwarded-For` (usually `1`). Blinkport selects the address at that trusted hop and ignores `X-Real-IP`; if the setting is missing or invalid in production, requests share a fail-closed rate-limit bucket. Configure the ingress to overwrite or safely append forwarding headers and prevent direct public access to the app origin.

## Launch checklist

- Point a domain with HTTPS to the chosen host and set `NEXT_PUBLIC_SITE_URL` to its canonical origin (for example, `https://blinkport.app`).
- Create a production Upstash Redis database; set its REST URL and token only in the hosting provider's secret settings.
- Set a monitored support email, company name, and the correct `TRUSTED_PROXY_HOPS` value. Ensure the app origin cannot be reached directly around the trusted proxy.
- Run `npm run launch:check`, `npm audit`, `npm test`, `npm run lint`, `npm run typecheck`, and `npm run build` before deploying.
- On the deployed site, test share creation, access-code and QR retrieval from a second device, file downloads, rate limits, and expiry after 10 minutes. Confirm expired content is no longer retrievable.
- Review the privacy and terms pages against the actual host, logging, retention, contact, and jurisdiction details before launch.
- Blinkport currently ships without ad or analytics scripts. Before enabling ads, choose the provider and consent approach, then update privacy disclosures and review the provider's site/content requirements. See [Google's required privacy content](https://support.google.com/adsense/answer/1348695?hl=en) and [site-readiness guidance](https://support.google.com/adsense/answer/7299563?hl=en-en). Approval is not guaranteed.

## Storage model

- Local development stores active shares and file bytes in process memory. Restarting the dev server clears them.
- Production stores share records, access-code mappings, and uploaded file bytes in Redis keys with a 10-minute TTL.
- No share content is written to the app's local filesystem.
- Redis storage is shared across app instances, so code lookup and share retrieval work across devices and instances.

## Notes

- File uploads are capped at 5 MB on both client and server
- API bodies are bounded before parsing; larger bodies receive HTTP 413
- Access-code lookup is limited to 20 attempts per client per minute
- Share creation is limited to 10 requests per client per minute
- Shares automatically expire after 10 minutes
- If a user wants to share the same content again after expiry, they must paste or upload it again
- Uploaded files are always downloaded as attachments
- Paste content is rendered as plain text, not HTML
- Public-facing policy and product pages are meant to support trust, crawl clarity, and ad-review readiness
