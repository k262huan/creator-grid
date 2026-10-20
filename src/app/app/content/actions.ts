"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { addMetric, createContent, deleteContent, updateContent } from "@/lib/content";
import { requireApplicationUser } from "@/lib/auth";

function nullable(value: FormDataEntryValue | null) { const text = String(value ?? "").trim(); return text || null; }
function contentPayload(formData: FormData) { return { title: String(formData.get("title") ?? ""), description: nullable(formData.get("description")), contentType: String(formData.get("contentType") ?? "other"), platform: nullable(formData.get("platform")), status: String(formData.get("status") ?? "idea"), scheduledAt: nullable(formData.get("scheduledAt")) ? new Date(String(formData.get("scheduledAt"))).toISOString() : null, assignedToUserId: nullable(formData.get("assignedToUserId")), brief: nullable(formData.get("brief")), script: nullable(formData.get("script")) }; }

export async function createContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const workspaceId = String(formData.get("workspaceId"));
  const created = await createContent(user.id, workspaceId, contentPayload(formData));
  revalidatePath("/app"); revalidatePath("/app/content");
  redirect(`/app/content/${created.id}`);
}

export async function updateContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const id = String(formData.get("id"));
  await updateContent(user.id, { id, ...contentPayload(formData) });
  revalidatePath("/app"); revalidatePath("/app/content"); revalidatePath(`/app/content/${id}`);
}

export async function deleteContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const id = String(formData.get("id"));
  await deleteContent(user.id, id);
  revalidatePath("/app"); revalidatePath("/app/content");
  redirect("/app/content");
}

export async function addMetricAction(formData: FormData) {
  const user = await requireApplicationUser();
  const contentItemId = String(formData.get("contentItemId"));
  await addMetric(user.id, { contentItemId, metricName: String(formData.get("metricName") ?? ""), metricValue: String(formData.get("metricValue") ?? "") });
  revalidatePath(`/app/content/${contentItemId}`);
}

export async function rescheduleContentAction(formData: FormData) {
  const user = await requireApplicationUser();
  const id = String(formData.get("id"));
  const value = String(formData.get("scheduledAt") ?? "").trim();
  await updateContent(user.id, { id, scheduledAt: value ? new Date(value).toISOString() : null });
  revalidatePath("/app/calendar"); revalidatePath(`/app/content/${id}`); revalidatePath("/app");
}
