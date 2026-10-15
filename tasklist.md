# CreatorGrid MVP Execution Task List

> **Purpose:** Sequential, checkable implementation plan for an AI coding agent.  
> **Source of truth:** `PRD.md` — CreatorGrid v1.0.  
> **Scope:** Phase 1 Core MVP only. Do not implement deferred Phase 2 features.  
> **Execution rule:** Complete tasks in order. Do not proceed past a Verification Gate until it passes. Never commit secrets or enable live Stripe payments.

## Global Execution Rules

- [x] Read `PRD.md` fully before changing code.
- [x] Confirm the repository's existing framework, package manager, and scripts before scaffolding or replacing files.
- [ ] Preserve existing working code unless a change is required by the PRD.
- [ ] Use the lockfile's package manager and pin dependencies through the lockfile.
- [ ] Use TypeScript strict mode, Zod validation, Drizzle ORM, and server-side authorization for privileged operations.
- [ ] Use server components by default; add client components only for required interactivity.
- [ ] Treat all client-supplied IDs, workspace IDs, plan identifiers, file metadata, and redirect values as untrusted.
- [ ] Do not use hardcoded demo data as production functionality.
- [ ] Keep `.env.local`, credentials, tokens, signing secrets, and provider responses containing sensitive data out of source control and logs.
- [ ] Keep Stripe in test mode for all MVP work. Do not configure live payment processing.
- [ ] Do not implement external social publishing or Phase 2 features.
- [ ] After each major task group, run the specified Verification Gate and fix failures before continuing.

---

## Module 1: Environment & Secret Key Setup (`.env.local`)

### 1.1 Inspect and prepare the project

- [x] Inspect the repository structure and identify the package manager from the existing lockfile.
- [x] Inspect `package.json` and record the existing scripts and dependency versions.
- [x] Confirm the project uses Next.js App Router and TypeScript, or scaffold the minimum required structure if no application exists.
- [x] Enable TypeScript strict mode in `tsconfig.json`.
- [x] Confirm linting and formatting conventions, adding consistent configuration only if missing.
- [x] Confirm `.gitignore` excludes `.env.local`, `.env.*.local`, build output, test artifacts, and local secrets.
- [x] Add a safe `.env.example` containing only documented variable names and placeholders.
- [x] Document the local setup sequence in `README.md`.

**Verification Gate 1A**
- [x] Run the package manager's install command and confirm dependencies install from the lockfile.
- [x] Run the existing lint and TypeScript-check scripts, or add those scripts if missing.
- [x] Run `npm run build` (or the equivalent package-manager command) and confirm the baseline application builds.
- [x] Inspect `git status` and confirm no secret file is staged or tracked.

### 1.2 Define environment variables and validation

- [x] Create `.env.local` locally without adding it to version control.
- [x] Add `NEXT_PUBLIC_APP_URL` with the local development origin.
- [x] Add `DATABASE_URL` for the Neon PostgreSQL connection.
- [x] Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
- [x] Add `CLERK_SECRET_KEY`.
- [x] Add `CLERK_WEBHOOK_SECRET`.
- [x] Add `STRIPE_SECRET_KEY` using a Stripe test-mode secret key.
- [x] Add `STRIPE_WEBHOOK_SECRET` for the local/test webhook endpoint.
- [x] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` using a Stripe test-mode publishable key.
- [x] Add `STRIPE_PRICE_CREATOR_PRO` for the configured test-mode Creator Pro price.
- [x] Add `STRIPE_PRICE_TEAM` for the configured test-mode Team price.
- [x] Add `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`.
- [x] Add `IMAGEKIT_PRIVATE_KEY`.
- [x] Add `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`.
- [x] Add `GEMINI_API_KEY`.
- [x] Add configurable `AI_DAILY_LIMIT_FREE`, `AI_DAILY_LIMIT_CREATOR_PRO`, and `AI_DAILY_LIMIT_TEAM` values.
- [x] Add configurable `MAX_UPLOAD_SIZE_BYTES` with the PRD's initial 10 MiB default.
- [x] Create a server-only environment schema using Zod.
- [x] Validate required environment variables before the associated integration is used.
- [x] Validate `NEXT_PUBLIC_APP_URL` as a trusted absolute URL.
- [x] Validate numeric limits as positive integers.
- [x] Keep secret variables out of any module imported by browser components.
- [x] Add a sanitized environment-validation helper that reports missing variable names without printing their values.
- [x] Ensure missing development values fail clearly rather than falling back to production credentials.
- [x] Ensure test-mode Stripe configuration is distinguishable from live configuration and reject live-mode keys in the MVP environment.

**Verification Gate 1B**
- [x] Run the environment schema's unit tests for valid, missing, malformed, and unsafe values.
- [x] Start the development server with required local variables configured and confirm it starts.
- [x] Remove one required variable temporarily and confirm the app reports a useful error without exposing secret values.
- [x] Search the repository and browser bundle for private-key literals and confirm none are present.
- [x] Run lint, TypeScript checks, and `npm run build`; confirm zero errors.

### 1.3 Establish test and deployment configuration

- [x] Define separate environment-variable sets for local development, automated tests, preview, and production.
- [x] Document how to provision Neon, Clerk, Stripe test-mode resources, ImageKit, and Gemini credentials.
- [x] Document how to configure local Stripe webhook forwarding without exposing the signing secret.
- [x] Document how deployment-host secrets are configured without committing them.
- [x] Document the rule that production payment processing remains disabled until separately approved.

**Verification Gate 1C**
- [x] Follow the README setup steps in a clean environment or fresh checkout.
- [x] Confirm `.env.example` contains placeholders only.
- [x] Confirm `.env.local` is ignored by Git.
- [x] Run lint, TypeScript checks, and `npm run build`; confirm all pass.

---

## Module 2: Database Schema & ORM Provisioning (Drizzle/PostgreSQL)

### 2.1 Install and configure Drizzle and Neon

- [x] Install compatible stable versions of `drizzle-orm`, the Neon PostgreSQL driver, `drizzle-kit`, and required TypeScript types.
- [x] Add scripts for schema generation, migration generation, migration application, and database inspection as appropriate to the selected driver.
- [x] Create `drizzle.config.ts` using server-side environment configuration.
- [x] Create `src/db/schema.ts`.
- [x] Create `src/db/index.ts` with a server-only database client.
- [x] Ensure the database client does not instantiate with missing credentials.
- [x] Configure TLS/secure connection settings appropriate to Neon.
- [x] Separate migration credentials from the least-privilege runtime database role where practical.
- [x] Ensure runtime code uses parameterized Drizzle queries rather than string-interpolated SQL.

**Verification Gate 2A**
- [ ] Confirm the application can establish a database connection to the intended development database.
- [x] Confirm the application fails safely when `DATABASE_URL` is missing or invalid.
- [x] Run the TypeScript check and `npm run build`; confirm no server-only database code leaks into client bundles.

### 2.2 Define core identity and workspace tables

- [x] Define the `users` table with UUID primary key, unique `clerk_user_id`, email, display name, timezone, locale, privacy-notice fields, marketing-consent fields, and timestamps.
- [x] Define the `workspaces` table with UUID primary key, name, unique slug, owner user reference, workspace type, and timestamps.
- [x] Define the `workspace_members` table with workspace/user references, role, join timestamp, and unique `(workspace_id, user_id)` constraint.
- [x] Define foreign keys and deletion behavior for users, workspaces, and workspace members.
- [x] Add database constraints for supported workspace types and MVP membership roles.
- [x] Ensure workspace ownership cannot be silently transferred during user deletion.
- [x] Define Drizzle relations for users, workspaces, and workspace membership.

**Verification Gate 2B**
- [x] Generate a migration and inspect it for correct foreign keys, unique constraints, and deletion behavior.
- [ ] Apply the migration to a clean development database.
- [ ] Run integration tests for identity uniqueness, membership uniqueness, and foreign-key failures.
- [ ] Confirm default workspace creation can be made idempotent at the data layer.

### 2.3 Define content and asset tables

- [x] Define the `content_items` table with workspace reference, creator and assignee references, title, description, content type, platform, status, brief, script, scheduled/published timestamps, archive timestamp, and created/updated timestamps.
- [x] Add database constraints for the supported content statuses: `idea`, `planned`, `in_production`, `in_review`, `approved`, `published`, and `archived`.
- [x] Add database constraints for the supported content types: video, podcast episode, short-form video, social-media post, blog article, and other.
- [x] Define the supported platform values or implement a controlled custom-platform value.
- [x] Add indexes for `(workspace_id, status)`, `(workspace_id, scheduled_at)`, and `(workspace_id, updated_at)`.
- [x] Define the `assets` table with workspace reference, uploader reference, ImageKit file ID, file name, delivery URL, MIME type, file size, and creation timestamp.
- [x] Add a unique constraint on `(workspace_id, imagekit_file_id)`.
- [x] Add an index on `assets.workspace_id`.
- [x] Define the `content_assets` join table with content and asset references, creation timestamp, and unique `(content_item_id, asset_id)` constraint.
- [x] Add an index on `content_assets.asset_id`.
- [x] Define `performance_metrics` with content reference, metric name, numeric value, recorded timestamp, and creation timestamp.
- [x] Add an index on `(content_item_id, recorded_at)`.
- [x] Define cross-table validation requirements so an asset and content item cannot be associated across workspaces.
- [x] Define deletion behavior so removing a content-asset association does not delete a shared underlying asset.
- [x] Define Drizzle relations for content, assets, content-asset associations, and performance metrics.

**Verification Gate 2C**
- [x] Generate and review the content/asset migration.
- [ ] Apply all migrations to a clean database.
- [ ] Test enum/check constraints, indexes, foreign keys, uniqueness, and invalid cross-workspace associations.
- [x] Confirm all timestamps use timezone-aware PostgreSQL types where specified.

### 2.4 Define subscription, AI usage, consent, and webhook tables

- [x] Define `subscriptions` with workspace reference, plan key, Stripe customer/subscription/price identifiers, status, billing-period timestamps, cancellation flag, and timestamps.
- [x] Add constraints for plan keys `free`, `creator_pro`, and `team`.
- [x] Add constraints for allowed subscription statuses.
- [x] Add a unique constraint for non-null Stripe subscription identifiers and an index on `workspace_id`.
- [x] Define `ai_usage_events` with workspace/user references, provider, model, feature key, token counts, status, and timestamp.
- [x] Add an index on `(workspace_id, created_at)`.
- [x] Define `privacy_consents` with user reference, consent type, notice version, consented flag, consent/withdrawal timestamps, and creation timestamp.
- [x] Define `stripe_webhook_events` with unique Stripe event ID, event type, processing status, processed timestamp, and creation timestamp.
- [x] Add constraints for valid webhook processing states.
- [x] Avoid storing raw AI prompts, generated content, payment-card data, or unnecessary raw webhook payloads.
- [x] Add Drizzle relations for the new tables.

**Verification Gate 2D**
- [x] Generate and inspect the migration for subscription, AI usage, privacy-consent, and webhook tables.
- [ ] Apply all migrations to a clean database.
- [ ] Test uniqueness of Stripe event IDs and subscription IDs.
- [ ] Test allowed plan/status constraints and foreign-key behavior.
- [ ] Run all database integration tests.

### 2.5 Migrations, transaction helpers, and Row-Level Security

- [x] Generate a baseline migration from the complete schema.
- [x] Review generated SQL before applying it.
- [x] Add a documented migration procedure for development and deployment.
- [ ] Add a transaction helper that verifies the Clerk session, resolves the application user, and sets a transaction-local trusted database user context.
- [ ] Ensure the identity context and protected queries execute on the same transaction and database connection.
- [ ] Enable RLS on workspace-owned tables.
- [ ] Add SELECT policies for authorized workspace members.
- [ ] Add INSERT policies for authorized workspace members.
- [ ] Add UPDATE policies that validate both the existing row and resulting row workspace authorization.
- [ ] Add DELETE policies using the intended MVP owner-level rule for destructive workspace operations.
- [ ] Apply equivalent policies to content items, assets, content-asset associations, performance metrics, subscriptions, and AI usage events.
- [ ] Protect privacy-consent records and user records according to the applicable user-access model.
- [ ] Add policies preventing content-asset associations between different workspaces.
- [ ] Configure the runtime database role without superuser or `BYPASSRLS` privileges.
- [ ] Ensure browser clients cannot set the trusted database identity context.
- [ ] Add integration tests for authorized and unauthorized database access.
- [ ] Add a clean-database migration test to verify migrations are reproducible.

**Verification Gate 2E**
- [ ] Apply all migrations from scratch to a clean test database.
- [ ] Run RLS tests with two separate users/workspaces and confirm cross-workspace reads and writes fail.
- [ ] Confirm runtime role privileges cannot bypass RLS.
- [ ] Confirm transaction-local identity context does not leak between pooled connections.
- [ ] Run database integration tests, lint, TypeScript checks, and `npm run build`.

---

## Module 3: Authentication & Protected Route Middleware

### 3.1 Integrate Clerk

- [ ] Install the supported Clerk Next.js integration at a compatible stable version.
- [ ] Add the Clerk provider to the root application layout.
- [ ] Create `/sign-in` using Clerk's supported sign-in UI.
- [ ] Create `/sign-up` using Clerk's supported registration UI.
- [ ] Configure email-based authentication and available verification mechanisms in Clerk.
- [ ] Add a sign-out action to the authenticated account menu.
- [ ] Create a server-side helper that requires a valid Clerk session.
- [ ] Create a server-side helper that resolves the Clerk user ID to the application `users` record.
- [ ] Reject protected operations if the session cannot be verified.
- [ ] Avoid trusting browser-submitted email addresses, user IDs, roles, or profile fields.
- [ ] Configure Clerk callback and redirect URLs for local development and preview environments.

**Verification Gate 3A**
- [ ] Test successful sign-up, verification where configured, sign-in, and sign-out.
- [ ] Test expired or missing sessions and confirm protected operations are denied.
- [ ] Confirm application identity is resolved using the verified Clerk user ID.
- [ ] Run auth tests, TypeScript checks, and `npm run build`.

### 3.2 Add route protection and authorization helpers

- [ ] Add Clerk middleware using the current supported Next.js middleware/proxy convention for the installed version.
- [ ] Keep marketing, features, pricing, privacy, sign-in, and sign-up routes public.
- [ ] Protect `/app` and all nested workspace pages.
- [ ] Protect all authenticated API routes except the Stripe webhook endpoint, which must use signature verification.
- [ ] Add server-side workspace membership checks for each protected data operation.
- [ ] Add a helper to verify that a content item belongs to an authorized workspace.
- [ ] Add a helper to verify that an asset belongs to an authorized workspace.
- [ ] Add a helper to verify that a content item and asset belong to the same workspace before linking them.
- [ ] Add a helper to verify owner-level permission for destructive actions and subscription management.
- [ ] Return safe `401` or `403` responses for unauthenticated or unauthorized API requests.
- [ ] Ensure route middleware is not the only authorization layer.
- [ ] Add tests that modify record IDs and workspace IDs to attempt insecure direct object reference access.

**Verification Gate 3B**
- [ ] Confirm unauthenticated users cannot load `/app` or its nested pages.
- [ ] Confirm authenticated users cannot read or mutate records in another workspace by changing IDs.
- [ ] Confirm direct API calls receive safe authorization errors.
- [ ] Run authorization tests and `npm run build`.

### 3.3 Idempotent user and default-workspace initialization

- [ ] Implement an idempotent server-side operation to create or update the application user from verified Clerk identity data.
- [ ] Implement a transaction that creates or retrieves the user's default personal workspace.
- [ ] Add the owner membership row during workspace initialization.
- [ ] Use unique constraints and conflict-safe logic to prevent duplicate users, workspaces, or memberships.
- [ ] Set a safe default timezone and locale when user preferences are not configured.
- [ ] Redirect newly authenticated users to `/app`.
- [ ] Add an onboarding empty state prompting the user to create the first content item.
- [ ] Add account settings fields for display name, timezone, and locale.
- [ ] Add privacy-notice acceptance and optional marketing-consent controls as applicable.
- [ ] Record consent/notice version and timestamps separately from marketing consent.

**Verification Gate 3C**
- [ ] Test first sign-in and confirm exactly one application user, personal workspace, and owner membership are created.
- [ ] Repeat initialization and confirm no duplicate records are created.
- [ ] Simulate concurrent initialization and confirm uniqueness constraints preserve consistency.
- [ ] Confirm consent fields are recorded separately and optional marketing consent defaults to false.
- [ ] Run integration tests, lint, TypeScript checks, and `npm run build`.

---

## Module 4: Cloud Storage & Third-Party API Integrations

### 4.1 Centralize plan configuration and entitlements

- [ ] Create `src/lib/plans.ts` with the `free`, `creator_pro`, and `team` plan keys.
- [ ] Define plan display names and configurable pricing/billing intervals.
- [ ] Define configurable content limits, AI daily limits, upload-size limits, and feature flags.
- [ ] Define plan capability flags for collaboration, client review, and advanced analytics without implementing deferred features.
- [ ] Create a server-side entitlement resolver based on verified subscription state.
- [ ] Enforce plan restrictions in server-side operations rather than only hiding UI.
- [ ] Implement atomic or transaction-safe AI usage counting to prevent concurrent requests bypassing limits.
- [ ] Ensure a plan downgrade never silently deletes content.
- [ ] Add tests for default Free entitlements, paid entitlements, inactive subscriptions, cancellation, and limit exhaustion.

**Verification Gate 4A**
- [ ] Run unit tests for plan mapping, entitlement resolution, and AI limit calculations.
- [ ] Confirm client-controlled state cannot grant a paid plan.
- [ ] Confirm AI limits are enforced server-side under concurrent requests.
- [ ] Run lint, TypeScript checks, and `npm run build`.

### 4.2 Integrate ImageKit uploads

- [ ] Install the compatible ImageKit SDK or supported upload-signing utility.
- [ ] Create a server-only ImageKit client using the private key and configured URL endpoint.
- [ ] Create `POST /api/assets/auth`.
- [ ] Require a valid Clerk session for upload authorization.
- [ ] Resolve the user's application record and authorized workspace server-side.
- [ ] Validate the requested upload destination and workspace association.
- [ ] Validate permitted MIME types and the configured maximum file size.
- [ ] Generate ImageKit upload authorization only after authorization and validation succeed.
- [ ] Return only the upload authorization values required by the client.
- [ ] Implement the client upload control with progress, success, failure, and retry states.
- [ ] Verify upload results server-side before recording asset metadata.
- [ ] Store ImageKit file ID, filename, URL, MIME type, size, workspace, uploader, and timestamp in PostgreSQL.
- [ ] Implement an authorized asset listing scoped to the current workspace.
- [ ] Implement a safe content-to-asset association action.
- [ ] Prevent duplicate content-asset associations.
- [ ] Implement removal of an asset association without automatically deleting the underlying file.
- [ ] Implement a separate controlled asset deletion path that verifies authorization and checks remaining references.
- [ ] Avoid duplicate database associations when a client retries a successful upload response.

**Verification Gate 4B**
- [ ] Test authorized upload-signature creation and confirm unauthenticated requests are denied.
- [ ] Test unsupported MIME types, oversized files, and attempts to target another workspace.
- [ ] Test metadata persistence and workspace-scoped asset listing.
- [ ] Test association removal and confirm shared assets remain available to other content items.
- [ ] Simulate ImageKit errors and confirm the UI preserves content and offers retry.
- [ ] Run ImageKit integration tests, TypeScript checks, and `npm run build`.

### 4.3 Integrate Gemini AI assistance

- [ ] Install the supported Gemini SDK or HTTP client.
- [ ] Create a server-only Gemini client that reads `GEMINI_API_KEY`.
- [ ] Create `POST /api/ai/generate`.
- [ ] Require a valid Clerk session.
- [ ] Resolve the authorized workspace and current plan entitlement before calling Gemini.
- [ ] Define a Zod request schema for supported AI actions: idea generation, brief drafting, title/hook suggestions, caption/outline drafting, and text refinement.
- [ ] Enforce maximum prompt length and allowed action types.
- [ ] Send only the minimum necessary user-provided content to Gemini.
- [ ] Enforce plan usage limits and rate limits before making provider requests.
- [ ] Request structured output where appropriate.
- [ ] Validate Gemini output before returning it to the browser.
- [ ] Treat AI output as untrusted text and never execute generated code or HTML.
- [ ] Add an AI-generated-content notice in the UI.
- [ ] Present generated suggestions as editable text that the user must review and save.
- [ ] Never automatically publish AI output.
- [ ] Record minimal AI usage metadata in `ai_usage_events` without storing raw prompts or drafts by default.
- [ ] Handle timeouts, quota errors, provider rate limits, unavailable models, malformed responses, and generic provider failures.
- [ ] Ensure failed AI requests do not overwrite existing brief or script content.
- [ ] Add rate limiting to the AI endpoint.

**Verification Gate 4C**
- [ ] Test successful responses for each supported AI action using provider mocks and a controlled integration test.
- [ ] Test invalid input, oversized prompts, unauthenticated requests, unauthorized workspaces, and exhausted plan limits.
- [ ] Test Gemini quota, timeout, malformed-output, and unavailable-model errors.
- [ ] Confirm AI secrets are server-only and raw prompts are not written to logs or stored by default.
- [ ] Confirm generated output remains editable and is never auto-published.
- [ ] Run AI unit/integration tests, lint, TypeScript checks, and `npm run build`.

### 4.4 Implement privacy data export and deletion operations

- [ ] Add an authenticated account-data export action.
- [ ] Export the user's relevant application-owned profile, workspace, content, asset metadata, consent, AI usage, and subscription-reference data in JSON or CSV.
- [ ] Ensure export includes only data the requesting user is authorized to access.
- [ ] Add an account deletion request flow with a clear explanation of consequences and retention exceptions.
- [ ] Require explicit confirmation before beginning deletion.
- [ ] Implement a controlled deletion orchestration process for application data and dependent resources.
- [ ] Handle workspace ownership and membership dependencies without silently transferring ownership.
- [ ] Handle ImageKit asset deletion through a controlled server-side process.
- [ ] Handle Clerk identity deletion through the supported server-side integration.
- [ ] Preserve only billing, security, or legal records that must be retained under the documented policy.
- [ ] Communicate pending, completed, and failed deletion states accurately.
- [ ] Add a public privacy notice route and include applicable collection, use, sharing, retention, access/correction, export, and deletion information.
- [ ] Add a practical contact pathway for privacy questions and data requests.
- [ ] Ensure the privacy notice and any applicable Personal Information Collection Statement accurately reflect actual integrations and behavior.

**Verification Gate 4D**
- [ ] Test export authorization, completeness, and cross-workspace isolation.
- [ ] Test deletion confirmation, dependent-record handling, and provider failure recovery.
- [ ] Confirm the app does not report deletion as complete before required steps are verified.
- [ ] Review the privacy notice against implemented data collection and third-party processing.
- [ ] Run privacy workflow tests, TypeScript checks, and `npm run build`.

---

## Module 5: Core UI Workspace & Canvas Components

### 5.1 Establish the design system and public pages

- [ ] Configure Tailwind CSS and shared design tokens for typography, spacing, colors, borders, and focus states.
- [ ] Create reusable accessible UI primitives for buttons, inputs, labels, selects, dialogs, status badges, alerts, loading states, and empty states.
- [ ] Ensure every form field has an associated label and accessible error message.
- [ ] Implement visible keyboard focus indicators.
- [ ] Add reduced-motion support for any motion effects.
- [ ] Build the public landing page at `/` with a clear CreatorGrid value proposition.
- [ ] Add the primary “Start for Free” CTA linking to sign-up.
- [ ] Add the secondary “Explore Features” CTA linking to `/features`.
- [ ] Add a representative product preview without presenting mock data as live user data.
- [ ] Add product benefit and workflow sections without unsupported performance claims.
- [ ] Build `/features` with MVP feature explanations.
- [ ] Build `/pricing` with Free, Creator Pro, and Team plan cards.
- [ ] Ensure the Free plan does not require payment details.
- [ ] Render plan pricing and billing intervals from centralized validated configuration.
- [ ] Show plan features, limits, collaboration availability, client-review availability, and appropriate CTA states.
- [ ] Build `/privacy` with the reviewed privacy notice and applicable PICS information.
- [ ] Add footer links for privacy, terms, and contact, ensuring each destination exists or is clearly marked as pending content rather than a broken link.
- [ ] Ensure public pages have loading/error behavior where applicable and responsive layouts.

**Verification Gate 5A**
- [ ] Visit `/`, `/features`, `/pricing`, and `/privacy` and confirm they render without runtime errors.
- [ ] Confirm pricing labels match the server-side plan configuration.
- [ ] Test public navigation and CTA destinations.
- [ ] Run responsive checks at mobile, tablet, and desktop widths.
- [ ] Run automated accessibility checks and `npm run build`.

### 5.2 Build authenticated workspace shell and dashboard

- [ ] Build the authenticated layout for `/app`.
- [ ] Add desktop sidebar navigation for Dashboard, Content, Calendar, Assets, and Settings.
- [ ] Add a responsive mobile navigation drawer or equivalent accessible navigation.
- [ ] Add workspace identity and an account menu with sign-out.
- [ ] Add the dashboard welcome area and quick actions for new content and calendar.
- [ ] Add database-backed content count cards by status.
- [ ] Add the upcoming scheduled content list.
- [ ] Add the recently updated content list.
- [ ] Add current subscription plan display and a pricing/upgrade link.
- [ ] Add an onboarding empty state for users with no content.
- [ ] Add loading, error, and retry states to dashboard data sections.
- [ ] Ensure all dashboard queries are scoped to the authenticated workspace.
- [ ] Paginate lists where needed and avoid unnecessary client-side JavaScript.

**Verification Gate 5B**
- [ ] Sign in and confirm the dashboard loads database-backed data for the current workspace.
- [ ] Confirm empty, loading, and error states work.
- [ ] Confirm dashboard counts and lists do not include other workspaces' data.
- [ ] Test dashboard navigation with keyboard and mobile viewport.
- [ ] Run dashboard tests, TypeScript checks, and `npm run build`.

### 5.3 Implement content data access and CRUD operations

- [ ] Create Zod schemas for content creation, updates, search, filters, sorting, status transitions, and deletion.
- [ ] Create server-side content data-access functions scoped to an authorized workspace.
- [ ] Implement content creation with title, description, type, platform, status, planned publication date, assignee, brief, and script fields.
- [ ] Implement content retrieval by ID with workspace authorization.
- [ ] Implement content updates with server-side validation and updated timestamps.
- [ ] Implement content deletion with authorization and dependent-data handling.
- [ ] Implement allowed status transitions and reject invalid transitions on the server.
- [ ] Implement content search by title.
- [ ] Implement filtering by status and platform.
- [ ] Implement sorting by planned publication date and last update.
- [ ] Implement pagination for larger content lists.
- [ ] Ensure a client cannot assign content to an unauthorized user.
- [ ] Add unit tests for status transition rules and content validation.

**Verification Gate 5C**
- [ ] Test create, read, update, and delete operations against PostgreSQL.
- [ ] Test search, filtering, sorting, and pagination.
- [ ] Test invalid status transitions and invalid enum values.
- [ ] Test IDOR attempts using another workspace's content ID.
- [ ] Confirm database writes are not falsely reported as successful when PostgreSQL fails.
- [ ] Run content unit/integration tests, lint, TypeScript checks, and `npm run build`.

### 5.4 Build content list, create form, and editor

- [ ] Build `/app/content` with a database-backed content list.
- [ ] Add title search to the content list.
- [ ] Add status filter controls.
- [ ] Add platform filter controls.
- [ ] Add sort controls for publication date and last update.
- [ ] Display content type, status, platform, and planned publication date for each item.
- [ ] Add a create-content CTA linking to `/app/content/new`.
- [ ] Build `/app/content/new` with labeled fields and validation feedback.
- [ ] Redirect to the new content editor after successful creation.
- [ ] Build `/app/content/[id]` with authorized loading and not-found/forbidden handling.
- [ ] Divide the editor into Overview, Brief, Script/Caption, Assets, and Scheduling sections or tabs.
- [ ] Add editable title, description, type, platform, status, assignee, and scheduling fields.
- [ ] Add editable brief and script/caption fields.
- [ ] Implement save actions through authenticated server-side operations.
- [ ] Display saving, saved, and error states.
- [ ] Preserve existing draft content when a save or provider request fails.
- [ ] Warn users about unsaved changes when navigating away where practical.
- [ ] Require confirmation for destructive content deletion.
- [ ] Add a simple manually entered performance metrics interface for published content, with validated metric name and numeric value.
- [ ] Do not implement automated cross-platform analytics.

**Verification Gate 5D**
- [ ] Complete the flow from creating an idea to editing its brief and script and reloading the page.
- [ ] Confirm saved content persists across sessions.
- [ ] Confirm invalid form data is rejected with accessible feedback.
- [ ] Confirm unsaved changes and deletion confirmation behave as intended.
- [ ] Confirm unauthorized content IDs reveal no private record details.
- [ ] Run end-to-end tests for content creation/editing and `npm run build`.

### 5.5 Implement calendar and timezone behavior

- [ ] Build `/app/calendar`.
- [ ] Implement month view navigation.
- [ ] Implement week view navigation.
- [ ] Display content items according to their planned publication timestamps.
- [ ] Display title and status for each calendar entry without relying on color alone.
- [ ] Allow authorized users to open content details from calendar entries.
- [ ] Allow authorized users to update planned publication dates.
- [ ] Display unscheduled content in a separate list or panel.
- [ ] Add an accessible list alternative for calendar entries.
- [ ] Use the user's configured timezone for display and date editing.
- [ ] Handle timezone conversion without silently shifting saved timestamps.
- [ ] Add a responsive calendar fallback for small screens.
- [ ] Add loading, empty, and error states for calendar data.

**Verification Gate 5E**
- [ ] Test month and week views with scheduled and unscheduled items.
- [ ] Test date edits and verify the saved timestamp is correct after reload.
- [ ] Test dates around timezone and daylight-saving boundaries.
- [ ] Confirm calendar entries and unscheduled lists are workspace-scoped.
- [ ] Test keyboard operation and the accessible list alternative.
- [ ] Run calendar tests, TypeScript checks, and `npm run build`.

### 5.6 Build asset library and editor integration

- [ ] Build `/app/assets` with workspace-scoped asset listings.
- [ ] Add an upload control connected to the ImageKit integration.
- [ ] Display upload progress and success/error feedback.
- [ ] Display asset filename, type, size, and preview where supported.
- [ ] Add an action to associate an asset with an authorized content item.
- [ ] Display assets associated with the current content item in its editor.
- [ ] Add an action to remove an asset association without deleting the underlying asset.
- [ ] Add an explicit, confirmed asset deletion action only if deletion checks are implemented.
- [ ] Add empty, loading, error, and retry states.
- [ ] Ensure asset delivery URLs are not treated as proof of workspace authorization.

**Verification Gate 5F**
- [ ] Upload a valid file and confirm metadata is stored and visible to the correct workspace.
- [ ] Confirm invalid and oversized files are rejected.
- [ ] Associate an asset with content and verify the association persists after reload.
- [ ] Remove an association and confirm the underlying shared asset remains.
- [ ] Confirm users cannot view, associate, or delete assets belonging to another workspace.
- [ ] Run asset integration tests, accessibility checks, and `npm run build`.

### 5.7 Connect AI assistance to content editing

- [ ] Add an AI assistance panel or action menu in the content editor.
- [ ] Add controls for generating ideas, briefs, titles/hooks, captions/outlines, and refining existing text.
- [ ] Send AI requests only to the authenticated server endpoint.
- [ ] Display the AI-generated-content notice near returned suggestions.
- [ ] Let users insert, edit, or discard generated suggestions before saving.
- [ ] Display loading, rate-limit, quota, and recoverable error states.
- [ ] Preserve current editor content when AI generation fails.
- [ ] Display a clear usage-limit message and upgrade link when the current plan limit is reached.
- [ ] Never trigger automatic publication from an AI action.

**Verification Gate 5G**
- [ ] Test each AI action through the editor using provider mocks or a controlled integration environment.
- [ ] Confirm returned suggestions can be edited and saved manually.
- [ ] Confirm a failed request does not overwrite existing text.
- [ ] Confirm plan limits and authorization are enforced server-side.
- [ ] Test keyboard access and screen-reader announcements for AI loading/error states.
- [ ] Run editor/AI end-to-end tests and `npm run build`.

### 5.8 Account settings and privacy controls

- [ ] Build `/app/settings`.
- [ ] Display the current account profile and workspace name.
- [ ] Allow supported profile preferences such as display name, timezone, and locale to be updated through server-side validation.
- [ ] Display the current plan and subscription state.
- [ ] Link to pricing and subscription management.
- [ ] Add a privacy-notice link and display the accepted notice version where appropriate.
- [ ] Add controls for optional marketing consent and withdrawal where applicable.
- [ ] Add an account-data export action.
- [ ] Add an account deletion request action with explanation and explicit confirmation.
- [ ] Display export and deletion status without claiming unverified completion.
- [ ] Add loading, success, empty, and error states for settings operations.

**Verification Gate 5H**
- [ ] Test profile updates and timezone persistence.
- [ ] Test privacy consent changes and verify timestamps/versions.
- [ ] Test data export and deletion request flows.
- [ ] Confirm settings data and actions are authorized and workspace-safe.
- [ ] Run settings tests, accessibility checks, and `npm run build`.

### 5.9 Accessibility, responsiveness, and product polish

- [ ] Audit all pages against WCAG 2.2 AA requirements in the PRD.
- [ ] Verify normal text contrast of at least 4.5:1 and large text contrast of at least 3:1.
- [ ] Verify visible keyboard focus across navigation, forms, dialogs, editor controls, and calendar.
- [ ] Verify semantic heading hierarchy and landmark structure.
- [ ] Verify accessible names and associated labels for interactive controls.
- [ ] Verify form errors and important status changes are announced to assistive technology.
- [ ] Verify dialog focus management and Escape-key behavior.
- [ ] Verify applicable touch target sizing and documented exceptions.
- [ ] Verify status meaning is not conveyed by color alone.
- [ ] Verify reduced-motion behavior.
- [ ] Test mobile, tablet, laptop, desktop, and browser zoom.
- [ ] Fix horizontal overflow in primary workflows.
- [ ] Add consistent error boundaries and safe user-facing error messages.
- [ ] Confirm no sensitive content, credentials, or stack traces appear in client-visible errors or logs.

**Verification Gate 5I**
- [ ] Run automated accessibility scans on landing, pricing, dashboard, content editor, calendar, assets, and settings.
- [ ] Complete manual keyboard testing for the primary user journeys.
- [ ] Complete a screen-reader spot check for navigation, forms, dialogs, calendar alternative, and validation errors.
- [ ] Confirm the main content workflow is usable on mobile without unnecessary horizontal scrolling.
- [ ] Run lint, TypeScript checks, all unit/integration tests, and `npm run build`.

---

## Module 6: Billing Integration, Webhooks, & Pre-Launch Audits

### 6.1 Configure Stripe test-mode products and prices

- [ ] Create or verify Stripe test-mode products/prices for Creator Pro and Team.
- [ ] Store Stripe Price IDs in server-side environment variables only.
- [ ] Validate plan identifiers against the centralized server-side plan registry.
- [ ] Ensure the Free plan never creates a Checkout session.
- [ ] Add a server-side helper to verify the Stripe client is configured with test-mode credentials.
- [ ] Define the policy for failed payments and cancellation, including whether access continues to the end of a paid period.
- [ ] Ensure plan prices displayed in the UI match the configured prices used by Checkout.
- [ ] Keep all live-mode Stripe credentials out of the MVP configuration.

**Verification Gate 6A**
- [ ] Confirm the configured Stripe products/prices are test-mode resources.
- [ ] Confirm unknown plan identifiers and client-supplied Price IDs are rejected.
- [ ] Confirm the Free plan does not initiate paid Checkout.
- [ ] Run billing configuration unit tests and `npm run build`.

### 6.2 Implement Checkout session creation

- [ ] Create `POST /api/stripe/checkout`.
- [ ] Require a valid Clerk session before creating a Checkout session.
- [ ] Resolve the authenticated application user and authorized workspace server-side.
- [ ] Validate the requested plan against the server-side allowlist.
- [ ] Reject plans that are unavailable, unconfigured, or not purchasable.
- [ ] Retrieve or create the Stripe customer using trusted server-side identifiers.
- [ ] Create the Checkout session with test-mode credentials.
- [ ] Set success and cancellation URLs using the trusted `NEXT_PUBLIC_APP_URL` origin.
- [ ] Attach trusted workspace/user metadata needed to reconcile the Checkout session.
- [ ] Use idempotency keys where appropriate to reduce duplicate session creation.
- [ ] Return only the required Checkout URL or session information.
- [ ] Redirect the user to Stripe-hosted Checkout.
- [ ] Add success and cancellation UI states that explain that subscription state is confirmed asynchronously.
- [ ] Ensure returning to `/app/settings?checkout=success` does not itself grant paid access.
- [ ] Prevent unauthorized workspace members from changing subscription state.

**Verification Gate 6B**
- [ ] Test successful test-mode Checkout session creation.
- [ ] Test unauthenticated requests, invalid plan keys, arbitrary Price IDs, and unsafe redirect values.
- [ ] Confirm success/cancel redirects do not modify entitlements.
- [ ] Confirm Checkout creation errors are handled without leaking secrets.
- [ ] Run Stripe integration tests and `npm run build`.

### 6.3 Implement signed, idempotent Stripe webhooks

- [ ] Create `POST /api/stripe/webhook`.
- [ ] Read the unmodified request body needed for signature verification.
- [ ] Verify the `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`.
- [ ] Reject invalid or missing signatures before processing the event.
- [ ] Validate supported Stripe event types.
- [ ] Insert each event ID into `stripe_webhook_events` with a unique constraint before applying effects.
- [ ] Handle duplicate and retried event deliveries idempotently.
- [ ] Process supported `checkout.session.completed` events.
- [ ] Process supported `customer.subscription.created` events.
- [ ] Process supported `customer.subscription.updated` events.
- [ ] Process supported `customer.subscription.deleted` events.
- [ ] Process supported `invoice.paid` events.
- [ ] Process supported `invoice.payment_failed` events.
- [ ] Reconcile current Stripe subscription state when event ordering makes the event payload insufficient.
- [ ] Verify the Stripe customer, subscription, workspace metadata, and configured plan before updating local state.
- [ ] Update subscription records transactionally where possible.
- [ ] Mark webhook processing state and timestamp only after successful processing.
- [ ] Return appropriate HTTP status codes so Stripe retries transient failures.
- [ ] Avoid storing unnecessary raw payment-event payloads.
- [ ] Add safe operational logging for persistent processing failures without logging secrets or sensitive payment data.
- [ ] Ensure paid entitlements are resolved from verified subscription state only.
- [ ] Implement the configured failed-payment and cancellation access policy.
- [ ] Preserve access until period end where the configured cancellation rules require it.

**Verification Gate 6C**
- [ ] Test a valid signed webhook and confirm the correct subscription record is updated.
- [ ] Test an invalid signature and confirm no subscription state changes.
- [ ] Replay the same event and confirm no duplicate effects occur.
- [ ] Test webhook retry after a simulated transient database error.
- [ ] Test out-of-order subscription events and verify reconciliation behavior.
- [ ] Test failed-payment, cancellation, and deleted-subscription behavior.
- [ ] Confirm no client redirect or client state can grant paid entitlements.
- [ ] Run webhook integration tests, TypeScript checks, and `npm run build`.

### 6.4 Subscription UI and entitlement enforcement

- [ ] Display the current plan and subscription status in settings and dashboard.
- [ ] Display appropriate upgrade actions for Free users.
- [ ] Display current-plan state for active paid users.
- [ ] Provide the configured subscription management/cancellation pathway.
- [ ] Refresh subscription state from the server after Checkout return without treating the return URL as proof of payment.
- [ ] Ensure all restricted server operations consult the entitlement resolver.
- [ ] Handle inactive, canceled, past-due, and payment-failed states according to the documented policy.
- [ ] Explain when a feature or usage limit is unavailable and provide an appropriate upgrade path.
- [ ] Ensure downgrade or cancellation does not silently delete user content.

**Verification Gate 6D**
- [ ] Test Free, Creator Pro, and Team plan displays against database-confirmed subscription state.
- [ ] Test upgrade, cancellation, failed payment, and stale client state.
- [ ] Confirm changing browser state or request payloads cannot unlock paid features.
- [ ] Run billing UI end-to-end tests and `npm run build`.

### 6.5 Automated tests and end-to-end user journeys

- [ ] Configure Vitest for unit and integration testing if not already configured.
- [ ] Configure Playwright for end-to-end testing if not already configured.
- [ ] Add unit tests for plan entitlement resolution.
- [ ] Add unit tests for content-status transition validation.
- [ ] Add unit tests for workspace authorization helpers.
- [ ] Add unit tests for all critical Zod request schemas.
- [ ] Add unit tests for AI usage-limit calculations.
- [ ] Add unit tests for subscription-status mapping.
- [ ] Add unit tests for date and timezone handling.
- [ ] Add integration tests for Clerk identity mapping.
- [ ] Add integration tests for idempotent workspace initialization.
- [ ] Add integration tests for content CRUD and PostgreSQL foreign-key behavior.
- [ ] Add integration tests for RLS policies.
- [ ] Add integration tests for ImageKit upload authorization.
- [ ] Add integration tests for Gemini error handling.
- [ ] Add integration tests for Stripe Checkout session creation in test mode.
- [ ] Add integration tests for webhook signature verification, deduplication, retries, and subscription updates.
- [ ] Add integration tests for account export and deletion workflows.
- [ ] Add an end-to-end test for registration and sign-in.
- [ ] Add an end-to-end test for default workspace initialization.
- [ ] Add an end-to-end test for creating, editing, and deleting a content item.
- [ ] Add an end-to-end test for editing a brief and script.
- [ ] Add an end-to-end test for changing content status.
- [ ] Add an end-to-end test for scheduling content on the calendar.
- [ ] Add an end-to-end test for uploading and associating an asset.
- [ ] Add an end-to-end test for generating an AI draft within plan limits.
- [ ] Add an end-to-end test for pricing and test-mode Checkout initiation.
- [ ] Add an end-to-end test for a verified Stripe test webhook and confirmed entitlements.
- [ ] Add an end-to-end test for attempted cross-workspace access.
- [ ] Add an end-to-end test for account-data export.
- [ ] Add an end-to-end test for the account deletion request flow.
- [ ] Add an end-to-end keyboard-navigation test for the main workflow.

**Verification Gate 6E**
- [ ] Run the complete unit test suite and confirm all tests pass.
- [ ] Run the complete integration test suite against an isolated test database.
- [ ] Run Playwright end-to-end tests against a test environment.
- [ ] Confirm tests do not depend on production data or live Stripe payments.
- [ ] Confirm failures are actionable and no required critical journey is skipped.

### 6.6 Security, privacy, accessibility, and reliability audit

- [ ] Verify unauthenticated users cannot access private workspace data.
- [ ] Verify users cannot read or mutate another workspace's records by changing UUIDs.
- [ ] Verify RLS policies cannot be bypassed by the runtime database role.
- [ ] Verify invalid Stripe webhooks cannot change subscription state.
- [ ] Verify browser code does not contain server-side secrets.
- [ ] Verify AI usage limits cannot be bypassed with concurrent requests.
- [ ] Verify upload signatures cannot be issued for unauthorized workspaces.
- [ ] Verify destructive actions cannot affect unrelated workspace data.
- [ ] Verify input validation covers request bodies, route parameters, enum values, UUIDs, prompt lengths, and upload metadata.
- [ ] Verify secure HTTP headers and applicable CSRF protections are configured.
- [ ] Verify rate limiting is enabled for AI requests, upload authorization, and abuse-prone endpoints.
- [ ] Verify application logs exclude credentials, raw prompts, generated drafts, and unnecessary personal data.
- [ ] Run dependency vulnerability checks and address known critical/high-severity issues.
- [ ] Verify privacy notice, applicable PICS, consent controls, retention policy, export, and deletion workflows reflect actual behavior.
- [ ] Verify WCAG 2.2 AA automated checks and manual keyboard/screen-reader checks have been completed.
- [ ] Verify recoverable error states for Neon, Clerk, Stripe, ImageKit, and Gemini failures.
- [ ] Verify database backup and restoration procedures for the selected Neon plan and operating policy.
- [ ] Verify production and preview environments use their own credentials and webhook configuration.

**Verification Gate 6F**
- [ ] Run all security acceptance tests and confirm every prohibited condition is blocked.
- [ ] Run automated accessibility checks and document manual test results.
- [ ] Confirm no unresolved critical or high-severity security issues remain.
- [ ] Confirm data export and deletion behavior is tested and retention exceptions are documented.
- [ ] Run dependency audit, lint, TypeScript checks, unit tests, integration tests, and `npm run build`.

### 6.7 Deployment readiness and final release gate

- [ ] Document local development, environment setup, database migrations, and test commands in `README.md`.
- [ ] Configure separate local, test, preview, and production environment variables.
- [ ] Verify the deployment environment has all required variables without printing secret values.
- [ ] Verify Clerk callback URLs and authentication settings for the deployed environment.
- [ ] Verify Stripe test-mode keys, Price IDs, and webhook endpoint configuration.
- [ ] Verify ImageKit upload authorization in the deployed environment.
- [ ] Verify Gemini requests run server-side in the deployed environment.
- [ ] Generate and review all Drizzle migrations.
- [ ] Apply migrations through the controlled deployment process.
- [ ] Run production-build lint and TypeScript checks.
- [ ] Run unit and integration tests before deployment.
- [ ] Run smoke tests for public pages, sign-in, protected routes, content CRUD, calendar, assets, AI, pricing, and settings.
- [ ] Verify RLS and cross-workspace authorization against the deployed test environment.
- [ ] Verify logs and error reporting do not expose secrets or sensitive content.
- [ ] Confirm the app works on mobile and desktop.
- [ ] Confirm no automatic social publishing or other deferred Phase 2 functionality is required for launch.
- [ ] Keep Stripe live-mode payment processing disabled until explicitly approved.

**Final Verification Gate**
- [ ] Run the project's lint command and confirm zero errors.
- [ ] Run the TypeScript check and confirm zero errors.
- [ ] Run all unit tests and confirm all pass.
- [ ] Run all integration tests and confirm all pass.
- [ ] Run all required Playwright end-to-end tests and confirm all pass.
- [ ] Run `npm run build` (or the equivalent command for the selected package manager) and confirm a successful production build.
- [ ] Confirm all required MVP Definition of Done items in `PRD.md` are satisfied.
- [ ] Confirm there are no hardcoded secrets, committed local environment files, or private keys in browser bundles.
- [ ] Confirm all payment entitlements change only after verified server-side Stripe events.
- [ ] Confirm cross-workspace data access is blocked by both application authorization and RLS.
- [ ] Confirm Phase 2 items below remain deferred.
- [ ] Record the release decision and any non-blocking known issues before launch.

---

## Deferred: Phase 2 Features (Do Not Implement in the MVP)

The following items are explicitly deferred by `PRD.md`. Keep them out of the MVP implementation unless a separate approved scope change is provided.

- [ ] **Deferred:** Multi-tenant agency management with multiple client workspaces.
- [ ] **Deferred:** Advanced multi-seat billing and team-seat provisioning.
- [ ] **Deferred:** Granular role-based permissions and custom roles.
- [ ] **Deferred:** Client review portals with shareable, expiring review links.
- [ ] **Deferred:** Multi-step approval workflows.
- [ ] **Deferred:** Usage-credit analytics and AI credit dashboards.
- [ ] **Deferred:** Advanced analytics dashboards and cross-platform performance aggregation.
- [ ] **Deferred:** Native integrations with YouTube, Instagram, TikTok, and podcast hosting services.
- [ ] **Deferred:** Automatic publishing and scheduling through external platform APIs.
- [ ] **Deferred:** OAuth connections to external social platforms.
- [ ] **Deferred:** Campaign-level planning and reporting.
- [ ] **Deferred:** Content templates and reusable production workflows.
- [ ] **Deferred:** Bulk import and export.
- [ ] **Deferred:** Advanced asset tagging and media-library search.
- [ ] **Deferred:** Automated notifications and reminders.
- [ ] **Deferred:** Recurring billing analytics and revenue reporting.
- [ ] **Deferred:** White-label agency workspaces.
- [ ] **Deferred:** Custom domains.
- [ ] **Deferred:** Advanced audit logs and enterprise administration.

> **Scope reminder:** The MVP supports a personal default workspace, basic content production management, month/week calendar views, brief/script editing, ImageKit asset handling, optional Gemini assistance, manual performance metric entry, privacy controls, and Stripe test-mode subscription upgrades. Do not add external publishing, advanced collaboration, or Phase 2 analytics as launch dependencies.
