"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireApplicationUser } from "@/lib/auth";
import { addMetric, contentInputSchema, deleteContent, metricSchema, createContent, updateContent } from "@/lib/content";

function formString(formData: FormData, name: string, fallback = "") {
  const value = formData.get(name);
  return typeof value === "string" ? value : fallback;
}

function nullable(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function normalizedDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid schedule date");
  return date.toISOString();
}

function contentPayload(formData: FormData) {
  return contentInputSchema.parse({
    title: formString(formData, "title"),
    description: nullable(formData.get("description")),
    contentType: formString(formData, "contentType", "other"),
    platform: nullable(formData.get("platform")),
    status: formString(formData, "status", "idea"),
    scheduledAt: normalizedDate(nullable(formData.get("scheduledAt"))),
    assignedToUserId: nullable(formData.get("assignedToUserId")),
    brief: nullable(formData.get("brief")),
    script: nullable(formData.get("script")),
  });
}

export async function createContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const workspaceId = formString(formData, "workspaceId");
  const created = await createContent(user.id, workspaceId, contentPayload(formData));
  revalidatePath("/app"); revalidatePath("/app/content");
  redirect(`/app/content/${created.id}`);
}

export async function updateContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const id = formString(formData, "id");
  await updateContent(user.id, { id, ...contentPayload(formData) });
  revalidatePath("/app"); revalidatePath("/app/content"); revalidatePath(`/app/content/${id}`);
}

export async function deleteContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const id = formString(formData, "id");
  await deleteContent(user.id, id);
  revalidatePath("/app"); revalidatePath("/app/content");
  redirect("/app/content");
}

export async function addMetricAction(formData: FormData) {
  const user = await requireApplicationUser();
  const input = metricSchema.parse({
    contentItemId: formString(formData, "contentItemId"),
    metricName: formString(formData, "metricName"),
    metricValue: formString(formData, "metricValue"),
  });
  await addMetric(user.id, input);
  revalidatePath(`/app/content/${input.contentItemId}`);
}

export async function rescheduleContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const id = formString(formData, "id");
  const value = formString(formData, "scheduledAt").trim();
  await updateContent(user.id, { id, scheduledAt: normalizedDate(value || null) });
  revalidatePath("/app/calendar"); revalidatePath(`/app/content/${id}`); revalidatePath("/app");
}
