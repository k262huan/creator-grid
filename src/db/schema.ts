import {
  bigint,
  boolean,
  check,
  foreignKey,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  timezone: text("timezone").notNull().default("UTC"),
  locale: text("locale").notNull().default("en"),
  privacyNoticeVersion: text("privacy_notice_version"),
  privacyNoticeAcceptedAt: timestamp("privacy_notice_accepted_at", { withTimezone: true }),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  marketingConsentAt: timestamp("marketing_consent_at", { withTimezone: true }),
  ...timestamps,
});

export const workspaces = pgTable("workspaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  ownerUserId: uuid("owner_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict", onUpdate: "cascade" }),
  workspaceType: text("workspace_type").notNull().default("personal"),
  ...timestamps,
}, (table) => [
  check("workspaces_workspace_type_check", sql`${table.workspaceType} in ('personal', 'team')`),
]);

export const workspaceMembers = pgTable("workspace_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  role: text("role").notNull().default("owner"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("workspace_members_workspace_user_unique").on(table.workspaceId, table.userId),
  check("workspace_members_role_check", sql`${table.role} in ('owner', 'editor')`),
  index("workspace_members_workspace_id_idx").on(table.workspaceId),
  index("workspace_members_user_id_idx").on(table.userId),
]);

export const contentItems = pgTable("content_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  assignedToUserId: uuid("assigned_to_user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  contentType: text("content_type").notNull(),
  platform: text("platform"),
  status: text("status").notNull().default("idea"),
  brief: text("brief"),
  script: text("script"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  ...timestamps,
}, (table) => [
  index("content_items_workspace_status_idx").on(table.workspaceId, table.status),
  index("content_items_workspace_scheduled_idx").on(table.workspaceId, table.scheduledAt),
  index("content_items_workspace_updated_idx").on(table.workspaceId, table.updatedAt),
  unique("content_items_workspace_id_unique").on(table.workspaceId, table.id),
  check("content_items_status_check", sql`${table.status} in ('idea', 'planned', 'in_production', 'in_review', 'approved', 'published', 'archived')`),
  check("content_items_type_check", sql`${table.contentType} in ('video', 'podcast_episode', 'short_form_video', 'social_media_post', 'blog_article', 'other')`),
]);

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
  uploadedByUserId: uuid("uploaded_by_user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  imagekitFileId: text("imagekit_file_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSizeBytes: bigint("file_size_bytes", { mode: "number" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("assets_workspace_id_idx").on(table.workspaceId),
  unique("assets_workspace_imagekit_file_unique").on(table.workspaceId, table.imagekitFileId),
  unique("assets_workspace_id_unique").on(table.workspaceId, table.id),
]);

export const contentAssets = pgTable("content_assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
  contentItemId: uuid("content_item_id").notNull(),
  assetId: uuid("asset_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  unique("content_assets_content_asset_unique").on(table.contentItemId, table.assetId),
  index("content_assets_asset_id_idx").on(table.assetId),
  index("content_assets_workspace_id_idx").on(table.workspaceId),
  foreignKey({
    columns: [table.workspaceId, table.contentItemId],
    foreignColumns: [contentItems.workspaceId, contentItems.id],
    name: "content_assets_content_workspace_fk",
  }).onDelete("cascade").onUpdate("cascade"),
  foreignKey({
    columns: [table.workspaceId, table.assetId],
    foreignColumns: [assets.workspaceId, assets.id],
    name: "content_assets_asset_workspace_fk",
  }).onDelete("cascade").onUpdate("cascade"),
]);

export const performanceMetrics = pgTable("performance_metrics", {
  id: uuid("id").defaultRandom().primaryKey(),
  contentItemId: uuid("content_item_id")
    .notNull()
    .references(() => contentItems.id, { onDelete: "cascade", onUpdate: "cascade" }),
  metricName: text("metric_name").notNull(),
  metricValue: numeric("metric_value", { precision: 18, scale: 4 }).notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("performance_metrics_content_recorded_idx").on(table.contentItemId, table.recordedAt),
  check("performance_metrics_value_check", sql`${table.metricValue} >= 0`),
]);

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
  planKey: text("plan_key").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  status: text("status").notNull().default("inactive"),
  currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  ...timestamps,
}, (table) => [
  index("subscriptions_workspace_id_idx").on(table.workspaceId),
  check("subscriptions_plan_key_check", sql`${table.planKey} in ('free', 'creator_pro', 'team')`),
  check("subscriptions_status_check", sql`${table.status} in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')`),
]);

export const aiUsageEvents = pgTable("ai_usage_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  featureKey: text("feature_key").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("ai_usage_events_workspace_created_idx").on(table.workspaceId, table.createdAt),
  check("ai_usage_events_status_check", sql`${table.status} in ('started', 'succeeded', 'failed', 'rate_limited')`),
  check("ai_usage_events_input_tokens_check", sql`${table.inputTokens} is null or ${table.inputTokens} >= 0`),
  check("ai_usage_events_output_tokens_check", sql`${table.outputTokens} is null or ${table.outputTokens} >= 0`),
]);

export const privacyConsents = pgTable("privacy_consents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  consentType: text("consent_type").notNull(),
  noticeVersion: text("notice_version").notNull(),
  consented: boolean("consented").notNull(),
  consentedAt: timestamp("consented_at", { withTimezone: true }).defaultNow().notNull(),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [index("privacy_consents_user_id_idx").on(table.userId)]);

export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  stripeEventId: text("stripe_event_id").notNull().unique(),
  eventType: text("event_type").notNull(),
  processingStatus: text("processing_status").notNull().default("pending"),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("stripe_webhook_events_status_check", sql`${table.processingStatus} in ('pending', 'processing', 'processed', 'failed')`),
  index("stripe_webhook_events_status_idx").on(table.processingStatus),
]);

export const usersRelations = relations(users, ({ many }) => ({
  workspaces: many(workspaces),
  memberships: many(workspaceMembers),
  createdContent: many(contentItems, { relationName: "contentCreator" }),
  assignedContent: many(contentItems, { relationName: "contentAssignee" }),
  uploadedAssets: many(assets),
  aiUsageEvents: many(aiUsageEvents),
  privacyConsents: many(privacyConsents),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerUserId], references: [users.id] }),
  members: many(workspaceMembers),
  contentItems: many(contentItems),
  assets: many(assets),
  subscriptions: many(subscriptions),
  aiUsageEvents: many(aiUsageEvents),
  contentAssets: many(contentAssets),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userId], references: [users.id] }),
}));

export const contentItemsRelations = relations(contentItems, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [contentItems.workspaceId], references: [workspaces.id] }),
  creator: one(users, { fields: [contentItems.createdByUserId], references: [users.id], relationName: "contentCreator" }),
  assignee: one(users, { fields: [contentItems.assignedToUserId], references: [users.id], relationName: "contentAssignee" }),
  assets: many(contentAssets),
  performanceMetrics: many(performanceMetrics),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [assets.workspaceId], references: [workspaces.id] }),
  uploader: one(users, { fields: [assets.uploadedByUserId], references: [users.id] }),
  contentItems: many(contentAssets),
}));

export const contentAssetsRelations = relations(contentAssets, ({ one }) => ({
  workspace: one(workspaces, { fields: [contentAssets.workspaceId], references: [workspaces.id] }),
  contentItem: one(contentItems, { fields: [contentAssets.contentItemId], references: [contentItems.id] }),
  asset: one(assets, { fields: [contentAssets.assetId], references: [assets.id] }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  contentItem: one(contentItems, { fields: [performanceMetrics.contentItemId], references: [contentItems.id] }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, { fields: [subscriptions.workspaceId], references: [workspaces.id] }),
}));

export const aiUsageEventsRelations = relations(aiUsageEvents, ({ one }) => ({
  workspace: one(workspaces, { fields: [aiUsageEvents.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [aiUsageEvents.userId], references: [users.id] }),
}));

export const privacyConsentsRelations = relations(privacyConsents, ({ one }) => ({
  user: one(users, { fields: [privacyConsents.userId], references: [users.id] }),
}));
