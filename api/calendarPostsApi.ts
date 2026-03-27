import type { DashboardCalendarPost } from "@/app/dashboards/calendarSync";

const CALENDAR_POSTS_ENDPOINT = "/api/calendar-posts";

export async function fetchCalendarPostsFromBackend(): Promise<DashboardCalendarPost[]> {
  const response = await fetch(CALENDAR_POSTS_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar posts (${response.status})`);
  }

  const data = (await response.json()) as { posts?: DashboardCalendarPost[] };
  return Array.isArray(data?.posts) ? data.posts : [];
}

export async function upsertCalendarPostToBackend(post: DashboardCalendarPost): Promise<void> {
  const response = await fetch(CALENDAR_POSTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ post }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Failed to save calendar post (${response.status})`);
  }
}

export async function deleteCalendarPostFromBackend(id: number): Promise<void> {
  const response = await fetch(CALENDAR_POSTS_ENDPOINT, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Failed to delete calendar post (${response.status})`);
  }
}
