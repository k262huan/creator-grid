import "server-only";

import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { withAuthorizedTransaction } from "@/db/authorized";
import { contentItems, performanceMetrics, users, workspaceMembers } from "@/db/schema";
import { createWorkspaceAuthorizationStore, requireContentItemAccess, requireWorkspaceMember } from "@/lib/authorization";
import { assertCanCreateContent, resolveEntitlements } from "@/lib/plans";

export const contentTypes = ["video", "podcast_episode", "short_form_video", "social_media_post", "blog_article", "other"] as const;
export const contentStatuses = ["idea", "planned", "in_production", "in_review", "approved", "published", "archived"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export const contentInputSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: z.string().trim().max(4_000).nullable().default(null),
  contentType: z.enum(contentTypes),
  platform: z.string().trim().max(80).nullable().default(null),
  status: z.enum(contentStatuses).default("idea"),
  scheduledAt: z.string().datetime({ offset: true }).nullable().default(null),
  assignedToUserId: z.string().uuid().nullable().default(null),
  brief: z.string().max(20_000).nullable().default(null),
  script: z.string().max(50_000).nullable().default(null),
});
export const contentUpdateSchema = contentInputSchema.partial().extend({ id: z.string().uuid() });
export const contentQuerySchema = z.object({
  workspaceId: z.string().uuid(), search: z.string().trim().max(120).default(""), status: z.enum(contentStatuses).optional(), platform: z.string().trim().max(80).optional(), sort: z.enum(["scheduledAt", "updatedAt"]).default("updatedAt"), page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
export const metricSchema = z.object({ contentItemId: z.string().uuid(), metricName: z.string().trim().min(1).max(80), metricValue: z.coerce.number().finite().nonnegative().max(1_000_000_000) });

const transitionMap: Record<ContentStatus, readonly ContentStatus[]> = {
  idea: ["planned", "archived"], planned: ["in_production", "idea", "archived"], in_production: ["in_review", "planned", "archived"], in_review: ["approved", "in_production", "archived"], approved: ["published", "in_review", "archived"], published: ["archived"], archived: ["idea"],
};

export function canTransitionContent(from: ContentStatus, to: ContentStatus): boolean { return from === to || transitionMap[from].includes(to); }
export function assertValidStatusTransition(from: string, to: string): void { if (!contentStatuses.includes(from as ContentStatus) || !contentStatuses.includes(to as ContentStatus) || !canTransitionContent(from as ContentStatus, to as ContentStatus)) throw new Error("Invalid content status transition"); }

async function assertAssigneeIsMember(tx: Parameters<Parameters<ReturnType<typeof getDb>["transaction"]>[0]>[0], workspaceId: string, assignedToUserId: string | null) {
  if (!assignedToUserId) return;
  const [member] = await tx.select({ id: workspaceMembers.userId }).from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, assignedToUserId))).limit(1);
  if (!member) throw new Error("Assignee must belong to the workspace");
}

export async function listContent(userId: string, query: z.infer<typeof contentQuerySchema>) {
  const input = contentQuerySchema.parse(query);
  await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), userId, input.workspaceId);
  const filters = [eq(contentItems.workspaceId, input.workspaceId)];
  if (input.search) filters.push(ilike(contentItems.title, `%${input.search}%`));
  if (input.status) filters.push(eq(contentItems.status, input.status));
  if (input.platform) filters.push(eq(contentItems.platform, input.platform));
  const order = input.sort === "scheduledAt" ? asc(contentItems.scheduledAt) : desc(contentItems.updatedAt);
  const rows = await getDb().select().from(contentItems).where(and(...filters)).orderBy(order).limit(input.pageSize).offset((input.page - 1) * input.pageSize);
  const [{ total }] = await getDb().select({ total: count() }).from(contentItems).where(and(...filters));
  return { rows, total, page: input.page, pageSize: input.pageSize, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) };
}

export async function getContent(userId: string, contentId: string) {
  const access = await requireContentItemAccess(createWorkspaceAuthorizationStore(getDb()), userId, contentId);
  const [row] = await getDb().select({ content: contentItems, assignee: { id: users.id, displayName: users.displayName, email: users.email } }).from(contentItems).leftJoin(users, eq(users.id, contentItems.assignedToUserId)).where(eq(contentItems.id, access.contentItemId)).limit(1);
  if (!row) throw new Error("Content item not found");
  const metrics = await getDb().select().from(performanceMetrics).where(eq(performanceMetrics.contentItemId, contentId)).orderBy(desc(performanceMetrics.recordedAt));
  return { ...row, metrics, workspaceId: access.workspaceId };
}

export async function createContent(userId: string, workspaceId: string, rawInput: unknown) {
  const input = contentInputSchema.parse(rawInput);
  await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), userId, workspaceId);
  return withAuthorizedTransaction(async (tx) => {
    await assertAssigneeIsMember(tx, workspaceId, input.assignedToUserId);
    await assertCanCreateContent(tx, workspaceId, resolveEntitlements());
    const [created] = await tx.insert(contentItems).values({ workspaceId, createdByUserId: userId, ...input, scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null }).returning();
    if (!created) throw new Error("Content creation failed");
    return created;
  });
}

export async function updateContent(userId: string, rawInput: unknown) {
  const input = contentUpdateSchema.parse(rawInput);
  const access = await requireContentItemAccess(createWorkspaceAuthorizationStore(getDb()), userId, input.id);
  return withAuthorizedTransaction(async (tx) => {
    const [current] = await tx.select().from(contentItems).where(eq(contentItems.id, access.contentItemId)).limit(1);
    if (!current) throw new Error("Content item not found");
    if (input.status) assertValidStatusTransition(current.status, input.status);
    await assertAssigneeIsMember(tx, access.workspaceId, input.assignedToUserId === undefined ? current.assignedToUserId : input.assignedToUserId);
    const [updated] = await tx.update(contentItems).set({ ...input, id: undefined, scheduledAt: input.scheduledAt === undefined ? undefined : input.scheduledAt ? new Date(input.scheduledAt) : null, updatedAt: new Date() }).where(eq(contentItems.id, access.contentItemId)).returning();
    if (!updated) throw new Error("Content update failed");
    return updated;
  });
}

export async function deleteContent(userId: string, contentId: string) {
  const access = await requireContentItemAccess(createWorkspaceAuthorizationStore(getDb()), userId, contentId);
  const [deleted] = await getDb().delete(contentItems).where(and(eq(contentItems.id, access.contentItemId), eq(contentItems.workspaceId, access.workspaceId))).returning({ id: contentItems.id });
  if (!deleted) throw new Error("Content deletion failed");
  return deleted;
}

export async function addMetric(userId: string, rawInput: unknown) {
  const input = metricSchema.parse(rawInput);
  const access = await requireContentItemAccess(createWorkspaceAuthorizationStore(getDb()), userId, input.contentItemId);
  const [metric] = await getDb().insert(performanceMetrics).values({ contentItemId: access.contentItemId, metricName: input.metricName, metricValue: String(input.metricValue) }).returning();
  if (!metric) throw new Error("Metric save failed");
  return metric;
}

export async function dashboardData(userId: string, workspaceId: string) {
  await requireWorkspaceMember(createWorkspaceAuthorizationStore(getDb()), userId, workspaceId);
  const statusCounts = await getDb().select({ status: contentItems.status, count: count() }).from(contentItems).where(eq(contentItems.workspaceId, workspaceId)).groupBy(contentItems.status);
  const upcoming = await getDb().select().from(contentItems).where(and(eq(contentItems.workspaceId, workspaceId), sql`${contentItems.scheduledAt} >= now()`, sql`${contentItems.status} <> 'archived'`)).orderBy(asc(contentItems.scheduledAt)).limit(5);
  const recent = await getDb().select().from(contentItems).where(eq(contentItems.workspaceId, workspaceId)).orderBy(desc(contentItems.updatedAt)).limit(5);
  return { statusCounts, upcoming, recent };
}
