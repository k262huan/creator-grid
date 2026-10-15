# PRD.md — CreatorGrid
**Product Requirements Document**

- **Product Name:** CreatorGrid
- **Document Version:** 1.0
- **Status:** Ready for MVP Development
- **Product Type:** SaaS Web Application
- **Primary Audience:** Solo creators, YouTubers, podcasters, small social-media teams, and creative agencies
- **Architecture:** Next.js App Router with TypeScript
- **Database:** Neon PostgreSQL with Drizzle ORM
- **Authentication:** Clerk
- **Payments:** Stripe Checkout (test mode for MVP)
- **AI Integration:** Gemini API
- **Asset Management:** ImageKit

---

## 1. Executive Summary

### 1.1 Product Overview

CreatorGrid is a content planning and production-management workspace designed for digital creators, independent publishers, small media teams, and creative agencies.

The platform centralizes content ideas, creative briefs, scripts, publishing schedules, media assets, approvals, and performance tracking into one organized workspace.

CreatorGrid aims to reduce fragmented workflows across spreadsheets, documents, messaging applications, and separate content calendars. Users can manage content from initial idea through production, review, publication, and performance analysis.

### 1.2 Problem Statement

Content creators and small creative teams frequently rely on disconnected tools to manage their production workflows. This can lead to:

- Lost content ideas and incomplete briefs.
- Unclear production statuses and responsibilities.
- Missed publishing deadlines.
- Disorganized scripts, images, and video assets.
- Slow approval cycles between creators, teammates, and clients.
- Difficulty comparing content performance across publishing channels.

CreatorGrid addresses these problems through a centralized, structured, and accessible content operations workspace.

### 1.3 Core Value Proposition

CreatorGrid enables users to plan, produce, organize, and review digital content from a single workspace, with clear production statuses and publishing schedules.

The MVP must provide a functional end-to-end workflow without requiring users to integrate external publishing platforms.

### 1.4 Target User Personas

**Persona A: Solo Creator**

- YouTubers, podcasters, bloggers, and social-media creators.
- Needs a simple way to organize ideas, scripts, assets, and publishing dates.
- Values ease of use, affordable pricing, and minimal setup.

**Persona B: Independent Creator Pro**

- Produces content across multiple channels.
- Needs reusable briefs, an editorial calendar, AI-assisted ideation, and performance tracking.
- Values production efficiency and consistent publishing.

**Persona C: Small Social-Media Team**

- Coordinates multiple contributors across ongoing campaigns.
- Needs task ownership, status tracking, shared assets, and approval workflows.
- Values visibility into production progress and deadlines.

**Persona D: Creative Agency**

- Manages content for multiple brands or clients.
- Needs organized workspaces, client review access, and repeatable production workflows.
- Values account separation, and scalable administration.

### 1.5 Monetization Mechanics

CreatorGrid uses a freemium SaaS business model.

| Plan | Target User | MVP Entitlements |
|---|---|---|
| Free | Solo creators | One personal workspace, basic content management, calendar, and limited AI assistance |
| Creator Pro | Active creators | Expanded content capacity, AI assistance, advanced planning, and performance tracking |
| Team | Small teams and agencies | Shared workspaces, collaboration, assignments, approvals, and optional client review access |

Exact prices, usage limits, and entitlements must be configurable rather than scattered throughout application code.

The pricing page must display available plans, features, billing intervals, and upgrade calls to action.

**Payment requirements:**

- Stripe Checkout must operate in test mode during the MVP.
- Successful payment must not be simulated solely through a client-side success message.
- Plan entitlements must be updated from verified Stripe webhook events.
- No real-money charges or live-mode payment processing are permitted during MVP development.
- Client review access is available only when enabled by the applicable plan.
- Cancellation and failed-payment states must be handled gracefully.

---

## 2. Product Goals and Success Metrics

### 2.1 Product Goals

1. Provide a centralized content planning and production workspace.
2. Enable users to manage content throughout its lifecycle.
3. Reduce friction between planning, production, review, and publishing.
4. Validate demand for paid creator and team plans.
5. Establish a secure foundation for future collaboration and integrations.

### 2.2 MVP Success Metrics

The following are initial validation targets, not guaranteed outcomes.

- At least 70% of new users complete workspace onboarding.
- At least 60% of onboarded users create their first content item.
- At least 40% of activated users return within seven days.
- At least 90% of valid content CRUD operations succeed.
- All payment entitlements are changed only after verified server-side payment events.
- No cross-workspace data access is possible through the application API.
- All critical user journeys pass automated or documented acceptance tests.

---

## 3. Phased Scope Isolation

### 3.1 Phase 1: Core MVP

Phase 1 includes only the features necessary to launch a functional content-management SaaS product.

#### P1. Authentication and Account Management

- Sign up and sign in using Clerk.
- Support email-based authentication and available Clerk verification mechanisms.
- Protect authenticated application routes.
- Provide sign-out functionality.
- Create or initialize a user's default workspace.
- Maintain a server-side mapping between Clerk users and application users.
- Provide account settings and privacy-related controls.

#### P2. Workspace Dashboard

- Display content counts by status.
- Show upcoming scheduled content.
- Show recently updated content.
- Provide quick actions for creating content and opening the calendar.
- Display the user's current subscription plan.
- Show clear empty states for new users.

#### P3. Content Management

Users must be able to create, read, update, and delete content items.

Each content item must support:

- Title.
- Description.
- Content type.
- Publishing platform.
- Production status.
- Planned publication date and time.
- Assigned user, when applicable.
- Creative brief.
- Script or caption.
- Asset references.
- Creation and modification timestamps.

Supported initial content types:

- Video.
- Podcast episode.
- Short-form video.
- Social-media post.
- Blog article.
- Other.

Supported initial production statuses:

- Idea.
- Planned.
- In Production.
- In Review.
- Approved.
- Published.
- Archived.

The status transition interface must validate allowed transitions on the server.

Content list views must support basic filtering by status and platform, searching by title, and sorting by publication date or last update.

#### P4. Content Calendar

- Provide month and week calendar views.
- Display content items by planned publication date.
- Allow users to open content details from calendar entries.
- Allow authorized users to change planned publication dates.
- Support unscheduled content in a separate list.
- Display dates in the user's configured timezone.

The MVP does not automatically publish content to external platforms.

#### P5. Creative Briefs and Scripts

- Provide editable brief and script fields within each content item.
- Support basic text formatting where practical.
- Save changes through authenticated server-side operations.
- Display saving, success, and error states.
- Prevent unauthorized access to drafts.

#### P6. Asset Management

- Allow authenticated users to upload supported media assets through ImageKit.
- Support images and common document or media formats according to configured file-size and MIME-type limits.
- Store asset metadata in PostgreSQL.
- Store asset delivery URLs and ImageKit file identifiers.
- Associate assets with content items.
- Allow authorized users to view and remove asset associations.

ImageKit credentials and upload-signing secrets must remain server-side. Upload authorization must verify workspace membership before issuing upload credentials.

Deleting an asset association must not accidentally delete a shared asset used by other content items.

#### P7. Basic AI Assistance

Use the Gemini API to provide optional assistance with:

- Generating content ideas.
- Drafting creative briefs.
- Suggesting titles and hooks.
- Producing initial captions or outlines.
- Refining user-provided draft text.

AI-generated content must remain editable and must never publish automatically.

Requirements:

- AI requests must originate from authenticated server-side endpoints.
- Validate and constrain user input.
- Enforce per-plan usage limits server-side.
- Handle provider errors and rate limits.
- Avoid sending unnecessary personal information to the AI provider.
- Display an appropriate notice when AI-generated output is presented.
- Never expose Gemini API keys in browser code.

#### P8. Pricing and Subscription Upgrades

- Provide Free, Creator Pro, and Team plan comparison.
- Display the current plan and applicable feature limits.
- Provide upgrade buttons.
- Create Stripe Checkout sessions from authenticated server-side actions.
- Use Stripe test-mode prices and credentials only.
- Validate requested plan identifiers against a server-side allowlist.
- Process signed Stripe webhook events.
- Store subscription identifiers, status, plan, and relevant billing timestamps.
- Display payment success or failure feedback based on server-confirmed state.
- Support a subscription management or cancellation pathway appropriate to the configured Stripe test environment.

A return to the Checkout success URL must not itself grant paid entitlements.

#### P9. Privacy and Security

- Enforce authentication on protected pages and mutations.
- Enforce workspace-level authorization on all data access.
- Validate all input using server-side schemas.
- Apply CSRF protections where relevant to the selected authentication and request architecture.
- Apply secure HTTP headers.
- Use rate limiting for AI requests, upload authorization, and other abuse-prone endpoints.
- Record consent timestamps and privacy-notice versions where required.
- Provide account-data export and deletion workflows.
- Prevent secrets and sensitive content from appearing in application logs.

### 3.2 Phase 2: Post-Launch Expansion

The following features are explicitly deferred and must not block the MVP.

- Multi-tenant agency management with multiple client workspaces.
- Advanced multi-seat billing and team-seat provisioning.
- Granular role-based permissions and custom roles.
- Client review portals with shareable, expiring review links.
- Multi-step approval workflows.
- Usage-credit analytics and AI credit dashboards.
- Advanced analytics dashboards and cross-platform performance aggregation.
- Native integrations with YouTube, Instagram, TikTok, and podcast hosting services.
- Automatic publishing and scheduling through external platform APIs.
- OAuth connections to external social platforms.
- Campaign-level planning and reporting.
- Content templates and reusable production workflows.
- Bulk import and export.
- Advanced asset tagging and media-library search.
- Automated notifications and reminders.
- Recurring billing analytics and revenue reporting.
- White-label agency workspaces.
- Custom domains.
- Advanced audit logs and enterprise administration.

Phase 2 features must be implemented only after the core MVP data model and authorization boundaries have been validated.

---

## 4. Functional Requirements

### 4.1 Requirement Priority

- **P0:** Mandatory for MVP launch.
- **P1:** Included in MVP where explicitly identified.
- **P2:** Deferred to Phase 2.

### 4.2 Core Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|---|---|---|---|
| FR-001 | Authentication | P0 | Unauthenticated users cannot access protected workspace data. |
| FR-002 | Workspace initialization | P0 | A new authenticated user receives a default workspace without duplicate initialization. |
| FR-003 | Content CRUD | P0 | Authorized users can create, read, update, and delete their content items. |
| FR-004 | Workspace isolation | P0 | A user cannot read or modify another workspace's content by changing an ID. |
| FR-005 | Content calendar | P0 | Dated content items appear on the correct calendar date. |
| FR-006 | Brief and script editor | P0 | Users can save and retrieve content briefs and scripts. |
| FR-007 | Asset upload | P0 | Valid authorized uploads are associated with the correct workspace. |
| FR-008 | AI assistance | P1 | Authenticated users can generate and edit AI suggestions within plan limits. |
| FR-009 | Pricing page | P0 | Users can compare all three plans and view the correct upgrade actions. |
| FR-010 | Stripe Checkout | P0 | Eligible users can initiate test-mode checkout from the server. |
| FR-011 | Stripe webhooks | P0 | Verified payment events update subscription state idempotently. |
| FR-012 | Privacy controls | P0 | Users can access the privacy notice and initiate account-data export or deletion. |
| FR-013 | Team collaboration | P2 | Advanced team-seat provisioning remains deferred. |
| FR-014 | Client review portal | P2 | External client review links are not required for MVP. |
| FR-015 | Usage-credit analytics | P2 | Detailed AI credit analytics remain deferred. |

---

## 5. Architecture and Technical Stack

### 5.1 Required Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend framework | Next.js App Router | Routing, layouts, server rendering, server actions, and API endpoints |
| Programming language | TypeScript | Type safety and maintainability |
| Styling | Tailwind CSS | Responsive UI and consistent design system |
| Database | Neon PostgreSQL | Persistent application data |
| ORM | Drizzle ORM | Schema definition, queries, and migrations |
| Authentication | Clerk | Sign-up, sign-in, sessions, and user identity |
| Payments | Stripe Checkout | Test-mode subscription checkout |
| Payment events | Stripe webhooks | Verified subscription-state updates |
| Media management | ImageKit | Asset storage, delivery, and upload authorization |
| AI provider | Gemini API | AI-assisted content ideation and drafting |
| Validation | Zod | Server-side request and configuration validation |
| Testing | Vitest and Playwright | Unit, integration, and end-to-end tests |
| Deployment | Next.js-compatible hosting | Production hosting and environment configuration |

Use current stable, mutually compatible versions of the required libraries. Pin dependencies through the package manager lockfile.

### 5.2 High-Level Architecture

```text
Browser
  |
  v
Next.js App Router
  |
  +--> Public Marketing Pages
  |
  +--> Clerk Authentication
  |
  +--> Protected Workspace UI
  |      |
  |      +--> Dashboard
  |      +--> Content Manager
  |      +--> Calendar
  |      +--> Asset Library
  |      +--> Pricing and Settings
  |
  +--> Server Actions / Route Handlers
         |
         +--> Authentication and Authorization
         +--> Zod Validation
         +--> Drizzle ORM
         |      |
         |      v
         |   Neon PostgreSQL
         |
         +--> Gemini API
         +--> ImageKit API
         +--> Stripe Checkout API
         +--> Stripe Webhook Handler
```

All privileged operations must execute on the server. Browser components must never receive database credentials, private provider keys, or Stripe secret keys.

### 5.3 Application Structure

Recommended project structure:

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── features/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── privacy/page.tsx
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (workspace)/
│   │   └── app/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── content/page.tsx
│   │       ├── content/new/page.tsx
│   │       ├── content/[id]/page.tsx
│   │       ├── calendar/page.tsx
│   │       ├── assets/page.tsx
│   │       └── settings/page.tsx
│   ├── api/
│   │   ├── ai/generate/route.ts
│   │   ├── assets/auth/route.ts
│   │   ├── stripe/checkout/route.ts
│   │   └── stripe/webhook/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── marketing/
│   ├── dashboard/
│   ├── content/
│   ├── calendar/
│   ├── assets/
│   └── billing/
├── db/
│   ├── schema.ts
│   ├── index.ts
│   └── migrations/
├── lib/
│   ├── auth/
│   ├── validation/
│   ├── permissions/
│   ├── stripe/
│   ├── imagekit/
│   ├── gemini/
│   └── plans.ts
├── actions/
│   ├── content.ts
│   ├── workspace.ts
│   └── account.ts
└── types/
```

This is the intended organization, not a requirement to create empty files for every module. Keep the final structure consistent with actual implementation.

---

## 6. Architecture and UI Layout

### 6.1 Route Definitions

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Marketing landing page |
| `/features` | Public | Product features and benefits |
| `/pricing` | Public | Plan comparison and upgrade entry points |
| `/privacy` | Public | Privacy notice |
| `/sign-in` | Public | Clerk sign-in |
| `/sign-up` | Public | Clerk registration |
| `/app` | Authenticated | Workspace dashboard |
| `/app/content` | Authenticated | Content list and filtering |
| `/app/content/new` | Authenticated | Create content |
| `/app/content/[id]` | Authorized workspace member | Edit content, briefs, scripts, and asset associations |
| `/app/calendar` | Authenticated | Editorial calendar |
| `/app/assets` | Authenticated | Asset library |
| `/app/settings` | Authenticated | Account, workspace, plan, and privacy settings |
| `/api/ai/generate` | Authenticated API | Generate AI-assisted drafts |
| `/api/assets/auth` | Authenticated API | Authorize ImageKit uploads |
| `/api/stripe/checkout` | Authenticated API | Create Stripe Checkout sessions |
| `/api/stripe/webhook` | Stripe-signed requests | Process payment events |

All route protection must be reinforced in the server-side data-access layer. Route middleware alone is insufficient authorization.

### 6.2 Landing Page

The landing page must explain the problem, demonstrate the product workflow, and direct users toward account creation.

**Hero section:**

- Headline communicating the all-in-one creator workspace.
- Supporting text explaining the idea-to-publication workflow.
- Primary CTA: "Start for Free".
- Secondary CTA: "Explore Features".
- Product UI preview or representative dashboard mockup.
- Responsive layout with clear visual hierarchy.

**Additional sections:**

1. Pain points and product benefits.
2. Content production workflow.
3. Feature highlights.
4. Dashboard or calendar preview.
5. Pricing summary.
6. FAQ.
7. Footer with privacy, terms, and contact links.

Avoid unsupported claims about productivity improvements, customer counts, or platform integrations.

### 6.3 Workspace Dashboard

Desktop layout:

```text
+--------------------------------------------------------------+
| CreatorGrid       Search                Help    Profile      |
+---------------+----------------------------------------------+
| Sidebar       | Dashboard                                    |
|               |                                              |
| Dashboard     | Welcome Back                                 |
| Content       | [New Content] [Open Calendar]                 |
| Calendar      |                                              |
| Assets        | [Total Items] [In Production] [Upcoming]      |
| Settings      |                                              |
|               | Upcoming Content                             |
|               | +------------------------------------------+ |
|               | | Title | Platform | Status | Publish Date | |
|               | +------------------------------------------+ |
|               |                                              |
|               | Recently Updated                             |
|               | [Content cards or compact list]               |
+---------------+----------------------------------------------+
```

**Key components:**

- Persistent navigation sidebar on desktop.
- Responsive navigation drawer on mobile.
- Workspace identity and account menu.
- Content summary cards.
- Upcoming publishing list.
- Recent activity or recently edited content.
- Empty-state guidance.
- Subscription status and upgrade link.
- Loading, error, and retry states.

Dashboard metrics must be calculated from authorized database records and must not use hardcoded demonstration data in production.

### 6.4 Content Management Interface

The content list must include:

- Search input.
- Status filter.
- Platform filter.
- Sort control.
- Content-type indicator.
- Publication date.
- Status badge.
- Create-content CTA.
- Edit and delete actions.

The content editor should use clearly labeled sections or tabs:

1. Overview.
2. Brief.
3. Script or caption.
4. Assets.
5. Scheduling.

Unsaved changes must be handled safely. Destructive actions require confirmation where appropriate.

### 6.5 Calendar Interface

- Month and week navigation.
- Current-date indicator.
- Content entries displaying title and status.
- Accessible list alternative for calendar content.
- Unscheduled-content panel.
- Date-editing controls.
- Responsive fallback for small screens.

Color must never be the sole indicator of status.

### 6.6 Pricing Table

The pricing page must present three clearly differentiated plan cards.

Each card must include:

- Plan name.
- Price and billing interval.
- Feature summary.
- Content or AI usage limits, if applicable.
- Collaboration availability.
- Client review availability.
- CTA.
- Current-plan or upgrade state for authenticated users.

The Free plan must not require payment information unless a documented product decision changes this requirement.

Paid-plan prices and Stripe Price IDs must come from validated server-side configuration. The displayed pricing information must match the configuration used to create Checkout sessions.

### 6.7 Primary User Journeys

**Journey A: New User Onboarding**

1. Visitor opens the landing page.
2. Visitor selects "Start for Free".
3. Clerk handles account creation.
4. The server verifies the authenticated user.
5. The application creates or retrieves the user's default workspace.
6. The user reaches `/app`.
7. The dashboard prompts the user to create the first content item.
8. The user saves an idea or draft.
9. The dashboard displays the new content item.

**Journey B: Content Production**

1. User opens the content manager.
2. User creates a content item.
3. User enters the title, type, platform, brief, and planned date.
4. User saves the item with status `idea` or `planned`.
5. User develops the script or caption.
6. User uploads supporting assets.
7. User changes the status as production progresses.
8. User marks the item as published after publishing externally.
9. User records available performance metrics.

**Journey C: AI-Assisted Drafting**

1. User opens a content item.
2. User requests an AI-generated idea, brief, title, or draft.
3. The server verifies identity, workspace authorization, and plan entitlement.
4. The server validates the request and checks usage limits.
5. The server sends the minimum necessary prompt to Gemini.
6. The server validates the provider response.
7. The user reviews, edits, and saves the result.

**Journey D: Subscription Upgrade**

1. User opens pricing or subscription settings.
2. User selects Creator Pro or Team.
3. The server validates the target plan.
4. The server creates a Stripe test-mode Checkout session.
5. The user completes or abandons Checkout.
6. Stripe sends the applicable signed webhook event.
7. The server verifies the signature and processes the event idempotently.
8. The subscription record is updated.
9. The application refreshes the user's entitlements.
10. The UI displays the confirmed subscription state.

**Journey E: Account Deletion**

1. User opens account settings.
2. User requests account deletion.
3. The application explains the consequences and retention exceptions.
4. The user confirms the request.
5. The server initiates a controlled deletion workflow.
6. Application-owned data and associated resources are deleted or anonymized according to the retention policy.
7. Clerk identity and external assets are handled through the appropriate server-side integrations.
8. Completion or pending status is communicated to the user.

---

## 7. Database Schema and ORM Design

### 7.1 Database Principles

- Use Neon PostgreSQL as the authoritative application database.
- Use Drizzle ORM for schema declarations, queries, and migrations.
- Use UUID primary keys for application-owned records.
- Use PostgreSQL `timestamptz` for timestamps.
- Use foreign keys with `ON DELETE CASCADE` for dependent records where appropriate.
- Store monetary values in integer minor units or use Stripe as the authoritative source for subscription billing amounts.
- Store Clerk user IDs as external identity identifiers rather than assuming they are UUIDs.
- Index workspace identifiers and common query filters.
- Enforce tenant boundaries in every data-access operation.
- Use migrations for all schema changes.
- Never rely on client-side filtering as a security boundary.

### 7.2 Entity Relationships

```text
users
  |
  +----< workspace_members >---- workspaces
                                      |
                                      +----< content_items
                                      |         |
                                      |         +----< content_assets >---- assets
                                      |         |
                                      |         +----< performance_metrics
                                      |
                                      +----< subscriptions
                                      |
                                      +----< ai_usage_events
```

In Phase 1, each user receives a default personal workspace. The schema supports workspace membership so that future team features can be added without redesigning the core content tables.

Advanced multi-tenant agency workflows and seat provisioning remain Phase 2 features.

### 7.3 Table: `users`

Purpose: Store application-level user preferences and identity mapping.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `clerk_user_id` | `text` | Unique, not null |
| `email` | `text` | Not null |
| `display_name` | `text` | Nullable |
| `timezone` | `text` | Not null, default `UTC` |
| `locale` | `text` | Not null, default `en` |
| `privacy_notice_version` | `text` | Nullable |
| `privacy_notice_accepted_at` | `timestamptz` | Nullable |
| `marketing_consent` | `boolean` | Not null, default `false` |
| `marketing_consent_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Not null, default `now()` |
| `updated_at` | `timestamptz` | Not null, default `now()` |

Requirements:

- `clerk_user_id` must be unique.
- Authentication identity must be verified by Clerk.
- Marketing consent must remain separate from acceptance of the privacy notice.
- Email addresses must not be used as the sole authorization key.
- Application data must not assume that an email address is permanently immutable.

### 7.4 Table: `workspaces`

Purpose: Represent personal workspaces and the foundation for future team workspaces.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `name` | `text` | Not null |
| `slug` | `text` | Unique, not null |
| `owner_user_id` | `uuid` | Foreign key to `users.id`, not null |
| `workspace_type` | `text` | Not null, default `personal` |
| `created_at` | `timestamptz` | Not null, default `now()` |
| `updated_at` | `timestamptz` | Not null, default `now()` |

Constraints:

- `owner_user_id` references `users.id`.
- Owner deletion must not silently transfer ownership.
- Use a controlled account-deletion workflow before deleting a workspace owner.
- The default workspace must be created idempotently.
- Validate `workspace_type` against an allowed set such as `personal` and `team`.

### 7.5 Table: `workspace_members`

Purpose: Map users to workspaces and prepare for future collaboration.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `workspace_id` | `uuid` | Foreign key to `workspaces.id`, `ON DELETE CASCADE` |
| `user_id` | `uuid` | Foreign key to `users.id`, `ON DELETE CASCADE` |
| `role` | `text` | Not null, default `owner` |
| `joined_at` | `timestamptz` | Not null, default `now()` |

Constraints:

- Unique composite constraint on `(workspace_id, user_id)`.
- Allowed roles for the MVP: `owner`, `editor`.
- The workspace owner must have owner-level authorization.
- Prevent deletion of the final owner without an explicit ownership-transfer or workspace-deletion workflow.
- Team invitations and advanced role administration are deferred.

### 7.6 Table: `content_items`

Purpose: Store content ideas and production records.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `workspace_id` | `uuid` | Foreign key to `workspaces.id`, `ON DELETE CASCADE` |
| `created_by_user_id` | `uuid` | Foreign key to `users.id`, nullable if retained through a controlled deletion process |
| `assigned_to_user_id` | `uuid` | Foreign key to `users.id`, nullable |
| `title` | `text` | Not null |
| `description` | `text` | Nullable |
| `content_type` | `text` | Not null |
| `platform` | `text` | Nullable |
| `status` | `text` | Not null, default `idea` |
| `brief` | `text` | Nullable |
| `script` | `text` | Nullable |
| `scheduled_at` | `timestamptz` | Nullable |
| `published_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Not null, default `now()` |
| `updated_at` | `timestamptz` | Not null, default `now()` |
| `archived_at` | `timestamptz` | Nullable |

Constraints and indexes:

- Index `(workspace_id, status)`.
- Index `(workspace_id, scheduled_at)`.
- Index `(workspace_id, updated_at)`.
- Validate `status` against the supported lifecycle values.
- Validate `content_type` against the supported content types.
- Validate `platform` against supported platform values or permit a controlled custom value.
- Every query must enforce workspace authorization.
- Hard deletion is permitted only after the application has confirmed authorization and handled dependent data.

### 7.7 Table: `assets`

Purpose: Store metadata for files managed through ImageKit.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `workspace_id` | `uuid` | Foreign key to `workspaces.id`, `ON DELETE CASCADE` |
| `uploaded_by_user_id` | `uuid` | Foreign key to `users.id`, nullable |
| `imagekit_file_id` | `text` | Not null |
| `file_name` | `text` | Not null |
| `file_url` | `text` | Not null |
| `mime_type` | `text` | Not null |
| `file_size_bytes` | `bigint` | Not null |
| `created_at` | `timestamptz` | Not null, default `now()` |

Constraints:

- Index `workspace_id`.
- Unique constraint on `(workspace_id, imagekit_file_id)`.
- Reject unsupported MIME types and oversized files.
- Treat `file_url` as a delivery reference, not proof of authorization.
- Asset deletion must verify workspace ownership.
- External file deletion must be performed through a controlled server-side workflow.

### 7.8 Table: `content_assets`

Purpose: Associate content items with assets.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `content_item_id` | `uuid` | Foreign key to `content_items.id`, `ON DELETE CASCADE` |
| `asset_id` | `uuid` | Foreign key to `assets.id`, `ON DELETE CASCADE` |
| `created_at` | `timestamptz` | Not null, default `now()` |

Constraints:

- Unique composite constraint on `(content_item_id, asset_id)`.
- Index `asset_id`.
- Before inserting a link, verify that the content item and asset belong to the same workspace.
- Deleting an association must not automatically delete the underlying file unless explicitly requested and no remaining references exist.

### 7.9 Table: `performance_metrics`

Purpose: Store manually entered performance data for published content.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `content_item_id` | `uuid` | Foreign key to `content_items.id`, `ON DELETE CASCADE` |
| `metric_name` | `text` | Not null |
| `metric_value` | `numeric(18,4)` | Not null |
| `recorded_at` | `timestamptz` | Not null, default `now()` |
| `created_at` | `timestamptz` | Not null, default `now()` |

Constraints:

- Index `(content_item_id, recorded_at)`.
- Validate metric names and acceptable numeric ranges.
- Metrics are manually entered during MVP.
- Automated platform analytics are deferred to Phase 2.

### 7.10 Table: `subscriptions`

Purpose: Maintain local subscription state synchronized with Stripe.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `workspace_id` | `uuid` | Foreign key to `workspaces.id`, `ON DELETE CASCADE` |
| `plan_key` | `text` | Not null |
| `stripe_customer_id` | `text` | Nullable |
| `stripe_subscription_id` | `text` | Nullable, unique |
| `stripe_price_id` | `text` | Nullable |
| `status` | `text` | Not null, default `inactive` |
| `current_period_start` | `timestamptz` | Nullable |
| `current_period_end` | `timestamptz` | Nullable |
| `cancel_at_period_end` | `boolean` | Not null, default `false` |
| `created_at` | `timestamptz` | Not null, default `now()` |
| `updated_at` | `timestamptz` | Not null, default `now()` |

Requirements:

- Allow only configured plan keys: `free`, `creator_pro`, and `team`.
- Validate subscription status values.
- Index `workspace_id`.
- Use verified webhook events as the authority for paid subscription changes.
- Prevent duplicate active subscriptions where the business rules require a single subscription per workspace.
- Do not grant paid access merely because the client returned from Checkout.
- Maintain a separate entitlement resolver so feature access does not depend on UI visibility.

### 7.11 Table: `ai_usage_events`

Purpose: Track AI usage for limits, auditing, and future credit analytics.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `workspace_id` | `uuid` | Foreign key to `workspaces.id`, `ON DELETE CASCADE` |
| `user_id` | `uuid` | Foreign key to `users.id`, nullable |
| `provider` | `text` | Not null |
| `model` | `text` | Not null |
| `feature_key` | `text` | Not null |
| `input_tokens` | `integer` | Nullable |
| `output_tokens` | `integer` | Nullable |
| `status` | `text` | Not null |
| `created_at` | `timestamptz` | Not null, default `now()` |

Requirements:

- Index `(workspace_id, created_at)`.
- Record only the usage data required for enforcement and operational analysis.
- Do not store raw prompts or generated content by default.
- Enforce usage limits server-side.
- Detailed usage-credit analytics and dashboards remain Phase 2 features.

### 7.12 Table: `privacy_consents`

Purpose: Maintain explicit consent records where consent is the appropriate legal basis.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `user_id` | `uuid` | Foreign key to `users.id`, `ON DELETE CASCADE` |
| `consent_type` | `text` | Not null |
| `notice_version` | `text` | Not null |
| `consented` | `boolean` | Not null |
| `consented_at` | `timestamptz` | Not null, default `now()` |
| `withdrawn_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Not null, default `now()` |

Requirements:

- Record consent for specific purposes rather than using a single blanket consent.
- Support withdrawal when applicable.
- Keep marketing consent optional.
- Do not treat acceptance of a privacy notice as blanket consent to every processing activity.
- Preserve only records required for compliance, security, or legitimate legal obligations.

### 7.13 Table: `stripe_webhook_events`

Purpose: Prevent duplicate processing of Stripe webhook events.

| Column | PostgreSQL Type | Constraints |
|---|---|---|
| `id` | `uuid` | Primary key, default `gen_random_uuid()` |
| `stripe_event_id` | `text` | Unique, not null |
| `event_type` | `text` | Not null |
| `processing_status` | `text` | Not null, default `pending` |
| `processed_at` | `timestamptz` | Nullable |
| `created_at` | `timestamptz` | Not null, default `now()` |

Requirements:

- Enforce uniqueness of Stripe event IDs.
- Verify signatures before processing event payloads.
- Process events transactionally where possible.
- Handle retries and duplicate deliveries safely.
- Avoid storing unnecessary raw payment-event payloads.
- Alert operators to persistent processing failures.

### 7.14 Drizzle ORM Implementation

- Define all tables and relations in `src/db/schema.ts` or appropriately separated schema modules.
- Use `pgTable`, UUID columns, PostgreSQL timestamp types, and explicit foreign-key actions.
- Add database-level uniqueness, check constraints, and indexes.
- Generate and review migrations before applying them.
- Run migrations through a controlled deployment process.
- Use parameterized ORM queries.
- Use transactions for multi-record operations such as workspace initialization and content-asset association.
- Avoid direct string interpolation in SQL statements.
- Ensure migrations are reproducible from a clean database.

### 7.15 Row-Level Security (RLS)

RLS must provide a second layer of defense for tenant isolation.

Because Clerk is an external authentication provider, PostgreSQL does not automatically know the authenticated Clerk identity. The application must establish a trusted database identity context for each request or use an equivalent verified authorization architecture.

Required policies:

1. Enable RLS on workspace-owned tables.
2. Resolve the authenticated application user through a trusted server-side identity mapping.
3. Allow workspace reads only when the current user is an authorized workspace member.
4. Allow inserts only when the user is authorized to create records in the target workspace.
5. Allow updates and deletes only when the user has the required workspace permissions.
6. Apply equivalent protection to related assets, metrics, subscriptions, and AI usage records.
7. Ensure content-asset associations cannot connect records from different workspaces.
8. Test policies against cross-workspace access attempts.
9. Never trust a client-supplied user ID or workspace ID as proof of authorization.

Illustrative PostgreSQL policy for `content_items`, assuming the application sets a transaction-scoped, verified application-user UUID:

```sql
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items FORCE ROW LEVEL SECURITY;

CREATE POLICY content_items_workspace_select
ON content_items
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = content_items.workspace_id
      AND wm.user_id =
        NULLIF(current_setting('app.user_id', true), '')::uuid
  )
);

CREATE POLICY content_items_workspace_insert
ON content_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = content_items.workspace_id
      AND wm.user_id =
        NULLIF(current_setting('app.user_id', true), '')::uuid
      AND wm.role IN ('owner', 'editor')
  )
);

CREATE POLICY content_items_workspace_update
ON content_items
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = content_items.workspace_id
      AND wm.user_id =
        NULLIF(current_setting('app.user_id', true), '')::uuid
      AND wm.role IN ('owner', 'editor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = content_items.workspace_id
      AND wm.user_id =
        NULLIF(current_setting('app.user_id', true), '')::uuid
      AND wm.role IN ('owner', 'editor')
  )
);

CREATE POLICY content_items_workspace_delete
ON content_items
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members wm
    WHERE wm.workspace_id = content_items.workspace_id
      AND wm.user_id =
        NULLIF(current_setting('app.user_id', true), '')::uuid
      AND wm.role = 'owner'
  )
);
```

**Implementation constraints for RLS:**

- The policy above is illustrative and must be adapted to the final role model.
- Set `app.user_id` only after verifying the Clerk session on the server.
- Set the value using transaction-local PostgreSQL settings, such as `set_config('app.user_id', value, true)`.
- Execute the setting and protected queries within the same database transaction and connection.
- Never allow browser clients to set a trusted user context.
- Avoid connection-pool leakage of identity context.
- Ensure the runtime database role is not a superuser and does not have `BYPASSRLS`.
- Ensure table ownership and migration roles do not accidentally bypass runtime policies.
- Apply equivalent policies to every protected table, not just `content_items`.
- Validate policies using integration tests that attempt both authorized and unauthorized access.

---

## 8. Third-Party API and Payment Boundaries

### 8.1 Environment Configuration

Create `.env.local` at the project root for local development.

Provide `.env.example` with placeholder values only.

Required variables:

```dotenv
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Neon PostgreSQL
DATABASE_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Stripe Test Mode
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_CREATOR_PRO=
STRIPE_PRICE_TEAM=

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=

# Gemini API
GEMINI_API_KEY=

# Optional operational configuration
AI_DAILY_LIMIT_FREE=5
AI_DAILY_LIMIT_CREATOR_PRO=50
AI_DAILY_LIMIT_TEAM=200
MAX_UPLOAD_SIZE_BYTES=10485760
```

Environment variable requirements:

- `.env.local` must be excluded from version control.
- All secret values must remain server-side.
- `NEXT_PUBLIC_` variables must contain only values safe to expose to browsers.
- Never place private keys in client components, public configuration files, screenshots, or logs.
- Validate required environment variables at application startup or before the relevant operation.
- Do not silently fall back to production credentials when a development variable is missing.
- Validate that Stripe keys and Price IDs belong to the intended test environment.
- Use hosting-provider secret management for deployed environments.
- Rotate any secret that has been accidentally exposed.

The daily AI limits above are initial configurable defaults, not finalized commercial commitments. Implement enforcement in the server-side entitlement layer.

### 8.2 Stripe Checkout Session Creation

Endpoint: `POST /api/stripe/checkout`

Required flow:

1. Verify the Clerk session.
2. Resolve the authenticated application user and authorized workspace.
3. Validate the requested plan against the server-side plan registry.
4. Verify that the plan is purchasable and configured.
5. Retrieve or create the corresponding Stripe customer using trusted server-side identifiers.
6. Create a Checkout session using test-mode Stripe credentials.
7. Set appropriate success and cancellation URLs using a trusted application origin.
8. Associate the session with trusted workspace and user identifiers through appropriate Stripe metadata.
9. Return only the Checkout URL or necessary session information.
10. Redirect the user to Stripe-hosted Checkout.

Security requirements:

- Never accept arbitrary Price IDs from the browser.
- Never accept a client-supplied amount as the authoritative purchase amount.
- Do not expose the Stripe secret key.
- Prevent unauthorized workspace members from changing subscription state.
- Use idempotency keys where appropriate to reduce duplicate Checkout creation.
- Validate redirect URLs to prevent open-redirect vulnerabilities.

Recommended URLs:

- Success: `/app/settings?checkout=success`
- Cancellation: `/pricing?checkout=cancelled`

These URLs are navigation destinations only. They do not independently determine subscription entitlements.

### 8.3 Stripe Webhook Listener

Endpoint: `POST /api/stripe/webhook`

The webhook handler must:

1. Read the unmodified request body required for Stripe signature verification.
2. Verify the `Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET`.
3. Reject invalid signatures.
4. Validate the event type.
5. Deduplicate events using `stripe_event_id`.
6. Process supported events safely and idempotently.
7. Update the relevant subscription record.
8. Commit successful database changes.
9. Return an appropriate HTTP status.
10. Support Stripe retries without creating duplicate subscription records.

Initial event types to support as required by the selected Checkout configuration:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

Event handling must account for the possibility that events arrive out of order. Where appropriate, retrieve the current Stripe subscription state rather than assuming event arrival order is authoritative.

Entitlement behavior:

- A completed Checkout session must be reconciled with the relevant Stripe subscription and customer.
- Paid access must reflect the verified subscription state and applicable billing rules.
- Failed payments must follow a documented grace-period or restricted-access policy.
- Cancellation must respect whether access continues until the paid period ends.
- Duplicate or retried webhook events must not create duplicate effects.

### 8.4 Clerk Integration

- Use Clerk's supported Next.js integration.
- Validate the authenticated session on all protected server operations.
- Verify Clerk webhook signatures before processing identity lifecycle events.
- Use Clerk user IDs as external identifiers.
- Make user and workspace initialization idempotent.
- Do not trust user profile fields submitted directly by the browser.
- Keep authorization decisions in server-side application code and database policies.

### 8.5 ImageKit Integration

- Use the public key and URL endpoint only where browser exposure is required.
- Generate upload authorization signatures on the server.
- Authenticate users before issuing upload signatures.
- Validate MIME type, file size, workspace ownership, and upload destination.
- Store the ImageKit file ID in PostgreSQL.
- Prevent unauthorized replacement or deletion of existing assets.
- Use controlled deletion and orphan-cleanup procedures.

### 8.6 Gemini API Integration

- Keep the API key on the server.
- Validate prompt size and content type.
- Enforce plan entitlements and rate limits before sending requests.
- Request structured output where it improves reliability.
- Validate the generated output before returning it to the client.
- Handle unavailable models, timeouts, quota errors, and malformed responses.
- Treat generated content as untrusted input.
- Do not execute generated code or HTML.
- Do not automatically publish generated content.

### 8.7 External Service Failure Handling

| Service | Failure Behavior |
|---|---|
| Clerk | Deny protected access when the session cannot be verified. |
| Neon PostgreSQL | Display a recoverable error and avoid falsely confirming writes. |
| Stripe | Preserve current confirmed subscription state until reconciliation succeeds. |
| ImageKit | Show upload failure and allow retry without creating duplicate associations. |
| Gemini | Display a recoverable error and preserve existing user drafts. |

---

## 9. Compliance, Privacy, and Security

### 9.1 WCAG 2.2 Level AA

All user-facing interfaces must target WCAG 2.2 Level AA.

Required standards:

- Normal text contrast ratio of at least 4.5:1.
- Large text contrast ratio of at least 3:1.
- Visible keyboard focus indicators.
- Focus ring baseline: `outline: 2px solid` with sufficient contrast.
- Keyboard accessibility for navigation, forms, dialogs, and calendar controls.
- Semantic HTML and correctly associated form labels.
- Accessible names for interactive controls.
- Appropriate heading hierarchy.
- Screen-reader announcements for validation errors and important status changes.
- Sufficient target sizes in accordance with WCAG 2.2 AA requirements, including the 24-by-24 CSS pixel minimum where applicable or the documented exceptions.
- No reliance on color alone to communicate meaning.
- Reduced-motion support where animation is present.
- Accessible modal focus management and Escape-key behavior.
- Responsive layouts that work at browser zoom and on small screens.

Testing must include automated accessibility checks and manual keyboard and screen-reader testing.

### 9.2 GDPR Privacy Requirements

CreatorGrid must implement privacy controls appropriate to its applicable legal obligations.

Requirements:

- Provide a clear privacy notice before or at the point of relevant data collection.
- Identify processing purposes and applicable legal bases.
- Collect only data necessary for the product.
- Provide mechanisms to request access, correction, export, and deletion where applicable.
- Record consent and withdrawal timestamps where consent is the applicable legal basis.
- Separate optional marketing consent from essential service operations.
- Document retention periods.
- Establish a process for handling data-subject requests.
- Document relevant processors and international data transfers.
- Apply appropriate security measures to personal data.
- Provide a process for assessing and responding to personal-data breaches.
- Avoid sending unnecessary personal data to AI or analytics providers.
- Support deletion or anonymization of application data, subject to lawful retention exceptions.

Consent must not be used as a substitute for another appropriate legal basis when consent is not required or is not freely given.

### 9.3 Hong Kong Personal Data (Privacy) Ordinance (PDPO)

CreatorGrid must support compliance with applicable Hong Kong PDPO obligations, including the Data Protection Principles.

Requirements:

- Provide a Personal Information Collection Statement (PICS) where appropriate.
- Explain the purpose of collection and whether provision of data is obligatory or voluntary, where applicable.
- Identify classes of persons to whom data may be transferred, where applicable.
- Explain relevant access and correction rights.
- Use personal data only for stated or otherwise legally permitted purposes.
- Apply reasonable security safeguards.
- Define data-retention periods and securely dispose of data when no longer required.
- Assess third-party processing arrangements and international transfers.
- Provide a practical channel for privacy questions and data-access or correction requests.

Privacy notices must accurately reflect actual product behavior and third-party services. Legal requirements should be reviewed by qualified counsel before public launch.

### 9.4 Data Minimization and Retention

- Collect only required account, workspace, content, billing-reference, and operational data.
- Do not store raw payment card details.
- Let Stripe handle payment-card collection.
- Avoid logging raw AI prompts, generated drafts, or unnecessary personal information.
- Define retention policies for audit records, AI usage events, and webhook metadata.
- Remove or anonymize records when the applicable retention period ends.
- Preserve only data required for legitimate legal, billing, security, or dispute-resolution purposes.
- Document any exceptions to deletion requests.

### 9.5 Security Controls

**Authentication and authorization**

- Verify Clerk sessions server-side.
- Enforce authorization for every protected record.
- Prevent insecure direct object reference vulnerabilities.
- Validate workspace membership before accessing any workspace-owned resource.
- Recheck permissions on every mutation.

**Input validation**

- Validate request bodies and URL parameters with Zod or equivalent schemas.
- Reject malformed UUIDs and unsupported enum values.
- Enforce upload-size and prompt-length limits.
- Sanitize user-generated content when rendering or transforming it.
- Prevent SQL injection through parameterized database queries.

**Secrets management**

- Never hardcode API keys, database URLs, signing secrets, or credentials.
- Keep `.env.local` out of version control.
- Use deployment-provider secret storage.
- Separate development and production credentials.
- Rotate exposed secrets.
- Use the minimum permissions required for each service account.

**Application protection**

- Configure secure cookies through the authentication provider.
- Apply appropriate Content Security Policy and other security headers.
- Use rate limiting and abuse prevention.
- Protect state-changing requests against relevant CSRF threats.
- Verify all webhook signatures.
- Avoid leaking internal errors or stack traces to users.
- Keep dependencies patched and scan for known vulnerabilities.

**Database protection**

- Use least-privilege database roles.
- Enforce RLS for workspace-owned data.
- Restrict migration credentials to migration operations.
- Use TLS for database connections.
- Back up data according to the selected Neon plan and operational policy.
- Test restoration procedures.
- Avoid production data in development and test environments unless properly protected.

### 9.6 Account Deletion and Data Export

The application must provide a documented workflow for account-data requests.

Data export should include relevant application-owned records in a structured format, such as JSON or CSV.

Deletion must account for:

- User profile records.
- Personal workspaces and dependent content.
- Workspace memberships.
- Asset metadata and external files.
- AI usage records.
- Consent records.
- Clerk identity.
- Stripe customer and subscription references.
- Required billing, security, and legal records that cannot immediately be deleted.

Use a deletion job or controlled orchestration process when external providers are involved. Do not report successful completion until the workflow has reached the appropriate verified state.

---

## 10. Plan Entitlements and Usage Enforcement

### 10.1 Centralized Plan Registry

Define plan features in a central server-side module such as `src/lib/plans.ts`.

Each plan should specify:

- Plan key.
- Display name.
- Price configuration.
- Billing interval.
- Maximum content items, if applicable.
- AI request limits.
- Maximum upload size.
- Collaboration capability.
- Client review capability.
- Access to advanced features.

Example conceptual configuration:

```ts
export const PLAN_KEYS = [
  "free",
  "creator_pro",
  "team",
] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export const PLAN_FEATURES = {
  free: {
    teamCollaboration: false,
    clientReview: false,
    advancedAnalytics: false,
  },
  creator_pro: {
    teamCollaboration: false,
    clientReview: false,
    advancedAnalytics: true,
  },
  team: {
    teamCollaboration: true,
    clientReview: true,
    advancedAnalytics: true,
  },
} satisfies Record<
  PlanKey,
  {
    teamCollaboration: boolean;
    clientReview: boolean;
    advancedAnalytics: boolean;
  }
>;
```

This example defines feature flags only. Numeric limits and billing prices must be defined separately using approved product configuration.

### 10.2 Enforcement Rules

- The server determines the user's current entitlements.
- Client-side feature hiding is not sufficient.
- Every restricted API operation must verify entitlement.
- Usage counters must be updated atomically where needed.
- Concurrent requests must not bypass usage limits.
- Paid features must not be enabled by editing local browser state.
- Subscription state must be reconciled with Stripe.
- Plan downgrades must not silently delete user content.
- When a limit is reached, provide a clear explanation and a relevant upgrade option.

---

## 11. Non-Functional Requirements

### 11.1 Performance

Initial targets:

- Public landing-page Largest Contentful Paint: 2.5 seconds or less at the 75th percentile under representative conditions.
- Interaction responsiveness: target an Interaction to Next Paint of 200 milliseconds or less at the 75th percentile.
- Cumulative Layout Shift: target 0.1 or less.
- Paginate large content lists.
- Optimize media through ImageKit transformations.
- Avoid unnecessary client-side JavaScript.
- Use server components by default unless client interactivity is needed.
- Add database indexes for frequent filtering and sorting.

These targets must be measured in realistic test and production environments.

### 11.2 Reliability

- Display recoverable error states.
- Prevent duplicate workspace initialization.
- Make webhook processing idempotent.
- Preserve user drafts when third-party services fail.
- Use database transactions for related mutations.
- Provide operational logging without exposing sensitive data.
- Establish a recovery process for failed external operations.

### 11.3 Maintainability

- Use TypeScript strict mode.
- Maintain a consistent linting and formatting configuration.
- Centralize plan definitions and entitlement checks.
- Separate data-access logic from presentation components.
- Validate all environment variables.
- Maintain documented database migrations.
- Use reusable UI components and design tokens.
- Document all external API integrations.

### 11.4 Responsive Design

Support:

- Desktop.
- Laptop.
- Tablet.
- Mobile browser.

The primary content-management workflow must remain usable on mobile without requiring horizontal scrolling for ordinary form fields or navigation.

---

## 12. Testing and Quality Assurance

### 12.1 Unit Tests

Test:

- Plan entitlement resolution.
- Content-status validation.
- Workspace authorization helpers.
- Request validation schemas.
- AI usage-limit calculations.
- Subscription-status mapping.
- Date and timezone handling.

### 12.2 Integration Tests

Test:

- Clerk identity mapping.
- Workspace initialization.
- Content CRUD against PostgreSQL.
- Database foreign-key behavior.
- RLS policies.
- ImageKit upload authorization.
- Gemini error handling.
- Stripe Checkout session creation in test mode.
- Stripe webhook signature verification.
- Webhook deduplication and retries.
- Account deletion and export workflows.

### 12.3 End-to-End Tests

Required scenarios:

1. Register and sign in.
2. Initialize a default workspace.
3. Create a content idea.
4. Edit the brief and script.
5. Change content status.
6. Schedule content on the calendar.
7. Upload and associate an asset.
8. Generate an AI-assisted draft within plan limits.
9. Open the pricing page.
10. Initiate a Stripe test-mode checkout.
11. Process a verified test webhook.
12. Confirm subscription entitlements.
13. Attempt unauthorized access to another workspace.
14. Request account-data export.
15. Exercise account deletion.
16. Navigate the main workflow using a keyboard.

### 12.4 Security Acceptance Tests

The release must fail if:

- An unauthenticated user can access private workspace data.
- A user can access another workspace by changing a UUID.
- A browser can grant itself a paid plan.
- An invalid Stripe webhook changes subscription state.
- An untrusted user can generate upload signatures for another workspace.
- An AI request bypasses server-side usage limits.
- Secrets are present in committed files or browser bundles.
- RLS policies can be bypassed by the runtime application role.
- Destructive operations affect unrelated workspace data.

---

## 13. Deployment and Environment Strategy

### 13.1 Environments

Maintain separate configurations for:

- Local development.
- Automated testing.
- Preview deployment.
- Production.

Use separate database instances or isolated databases, separate API credentials, and separate webhook configurations where practical.

### 13.2 Deployment Requirements

Before deployment:

1. Validate required environment variables.
2. Run linting and TypeScript checks.
3. Run unit and integration tests.
4. Generate and review Drizzle migrations.
5. Apply migrations through the deployment process.
6. Verify Clerk callback URLs.
7. Verify Stripe test-mode configuration.
8. Configure Stripe webhook endpoints.
9. Verify ImageKit upload authorization.
10. Verify Gemini server-side access.
11. Run smoke tests for protected routes and content CRUD.
12. Verify RLS policies against unauthorized access.
13. Confirm logging does not expose secrets or sensitive content.

Production payment processing must remain disabled until an explicit release decision authorizes live Stripe configuration.

---

## 14. MVP Definition of Done

CreatorGrid MVP is ready for release when all mandatory criteria below are satisfied.

### Authentication and Workspaces

- [ ] Clerk sign-up and sign-in work.
- [ ] Default workspace initialization is reliable and idempotent.
- [ ] Protected routes require authentication.
- [ ] Workspace authorization is enforced server-side.
- [ ] RLS is enabled and tested on protected tables.

### Content Management

- [ ] Users can create, edit, view, and delete content.
- [ ] Content statuses are validated.
- [ ] Briefs and scripts persist correctly.
- [ ] Search, filters, and sorting work.
- [ ] Calendar views display scheduled content correctly.
- [ ] Timezone handling is correct.

### Assets and AI

- [ ] ImageKit uploads require valid authorization.
- [ ] File type and size restrictions are enforced.
- [ ] Asset associations are workspace-safe.
- [ ] Gemini requests execute server-side.
- [ ] AI usage limits are enforced.
- [ ] AI failures preserve existing drafts.

### Monetization

- [ ] All three plans are visible on the pricing page.
- [ ] Upgrade buttons use server-validated plan identifiers.
- [ ] Stripe Checkout runs exclusively in test mode.
- [ ] Webhook signatures are verified.
- [ ] Duplicate webhook events are handled safely.
- [ ] Paid entitlements depend on verified subscription state.
- [ ] Failed payments and cancellations are handled correctly.

### Compliance and Security

- [ ] WCAG 2.2 AA checks have been performed.
- [ ] Text contrast meets the specified thresholds.
- [ ] Keyboard focus is visible.
- [ ] Privacy notice and applicable PICS are available.
- [ ] Consent records and timestamps are implemented where required.
- [ ] Account export and deletion workflows are documented and tested.
- [ ] No secrets are hardcoded or committed.
- [ ] No known critical or high-severity security issues remain unresolved.

### Product Quality

- [ ] Landing page clearly explains CreatorGrid.
- [ ] Dashboard has functional empty, loading, and error states.
- [ ] Main user journeys pass end-to-end tests.
- [ ] Application works on desktop and mobile.
- [ ] Environment setup is documented.
- [ ] Database migrations can be applied to a clean environment.
- [ ] Phase 2 features have not been introduced as mandatory MVP dependencies.

---

## 15. Implementation Guardrails

1. Build the application incrementally, validating each module before proceeding.
2. Implement authentication and workspace authorization before protected CRUD operations.
3. Establish the database schema and migrations before building dependent interfaces.
4. Keep all privileged API calls server-side.
5. Treat workspace IDs and record IDs supplied by the client as untrusted input.
6. Enforce authorization in both application logic and database policies.
7. Never use a successful redirect as proof of payment.
8. Never grant paid entitlements from client-controlled state.
9. Keep pricing, limits, and plan features in centralized configuration.
10. Keep API keys and credentials out of source control.
11. Use test-mode payments until live processing is explicitly approved.
12. Do not implement automatic publishing to social platforms in the MVP.
13. Do not implement multi-tenant agency seat provisioning in the MVP.
14. Do not implement advanced usage-credit analytics in the MVP.
15. Do not substitute mock data for required database-backed production functionality.
16. Use accessible components and verify keyboard interactions.
17. Do not claim legal compliance solely because technical controls exist; review notices, retention rules, and processing arrangements before launch.
18. Ensure all MVP acceptance criteria are testable and traceable to the implemented features.

---

## 16. Final Product Definition

CreatorGrid MVP is a secure, responsive content planning and production-management application that allows authenticated users to organize content ideas, write briefs and scripts, schedule publishing dates, manage assets, request AI assistance, record basic performance metrics, and explore subscription upgrades through Stripe test-mode Checkout.

The application must be built on Next.js App Router, TypeScript, Tailwind CSS, Drizzle ORM, Neon PostgreSQL, Clerk, Stripe, ImageKit, and Gemini.

The launch scope prioritizes a complete and reliable single-workspace content workflow, clear pricing, secure data boundaries, and validated subscription handling. Advanced agency collaboration, multi-seat management, client review portals, external social publishing, and detailed usage-credit analytics are deferred to Phase 2.

**The MVP is complete when users can reliably manage content from idea through publication tracking, while workspace data remains isolated, subscription changes are verified, secrets remain protected, and accessibility and privacy requirements are addressed.**
