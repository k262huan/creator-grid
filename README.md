# CreatorGrid

CreatorGrid is a Next.js App Router foundation for planning and producing creator content.

## Local setup

1. Use Node.js 22 or a compatible current LTS release.
2. Install dependencies from the npm lockfile:

   ```bash
   npm ci
   ```

3. Copy `.env.example` to `.env.local` and replace every `replace_me` value with credentials for the local/test resources.
4. Start the development server:

   ```bash
   npm run dev
   ```

5. Run validation before opening a change:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

## Database migrations

Drizzle uses `DATABASE_URL` from the server environment. The runtime client is lazy and will not instantiate when the variable is missing or when the URL is not a TLS-required PostgreSQL URL.

```bash
npm run db:generate
npm run db:check
npm run db:migrate
npm run db:studio
```

Review generated SQL under `src/db/migrations/` before applying it. Use an isolated Neon development database for local migration work and a separate least-privilege runtime role for the application where practical. Migration credentials belong only in the deployment or migration environment; do not place them in source control or browser code.

The environment validator reports only missing or invalid variable names. It never prints variable values. Required provider variables are validated immediately before the corresponding server integration is used.

## Environment strategy

- **Local development:** `.env.local`, using local development origins and test-mode provider resources.
- **Automated tests:** process environment variables supplied by the test runner; never use production data or live Stripe credentials.
- **Preview:** configure the same variable names through the hosting provider's preview secret store and use isolated Clerk, Neon, Stripe, ImageKit, and Gemini resources where available.
- **Production:** configure secrets through the hosting provider's secret manager, use a production database and provider resources, and keep Stripe live processing disabled until a separate release decision authorizes it.

`.env.local` and all other local environment files are ignored by Git. `.env.example` contains names and safe placeholders only.

## Vercel deployment

The GitHub repository is connected to the Vercel project `creator-grid`. Every push to `main` creates a Vercel production deployment after the Next.js build passes. Configure the variables from `.env.example` in Vercel Project Settings → Environment Variables for Preview and Production separately; never commit `.env.local` or provider secrets.

Before enabling a deployment that uses database-backed routes:

1. Apply the numbered Drizzle migrations to the target Neon database with the migration role: `npm run db:migrate`.
2. Set `DATABASE_URL` at runtime to a TLS-required URL for a least-privilege role that does not have `SUPERUSER` or `BYPASSRLS`.
3. Configure Clerk's allowed origins and redirect URLs for the Vercel deployment domain, including `/sign-in`, `/sign-up`, and `/app`.
4. Configure the Stripe test webhook endpoint at `/api/stripe/webhook` only after the webhook route is implemented and signature verification is enabled.

The Vercel build is credential-independent, but authenticated and database-backed acceptance tests require Preview environment variables and isolated test resources.

## Provider provisioning notes

- Provision a Neon PostgreSQL database with TLS enabled and store its connection URL in `DATABASE_URL`.
- Create a Clerk application, configure email authentication and callback URLs for each environment, and set the publishable, secret, and webhook signing values.
- Create Stripe **test-mode** products and prices for Creator Pro and Team. Configure a local webhook endpoint with the test signing secret. Never use live-mode keys for MVP development.
- With the Stripe CLI authenticated to the test account, forward events locally with `stripe listen --forward-to localhost:3000/api/stripe/webhook`; keep the signing secret in `.env.local` only.
- Create an ImageKit account and configure the public key, private key, and URL endpoint. Private signing credentials must remain server-side.
- Create a Gemini API key with the minimum required access and keep it server-side.

## Stripe safety rule

A Checkout success redirect is navigation only. Paid entitlements must be granted only from verified signed webhook events. Live Stripe credentials are rejected by the server environment schema.
