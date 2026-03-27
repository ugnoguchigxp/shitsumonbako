import type { Feedback } from "./types";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = typeof body.error === "string" ? body.error : "Request failed";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

export const createFeedback = async (payload: {
  targetText?: string;
  messageText: string;
}): Promise<Feedback> => {
  const response = await request<{ data: Feedback }>("/api/feedbacks", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return response.data;
};

export const fetchAdminFeedbacks = async (): Promise<Feedback[]> => {
  const response = await request<{ data: Feedback[] }>("/api/admin/feedbacks");
  return response.data;
};

export const deleteAdminFeedback = async (id: number): Promise<void> => {
  await request<void>(`/api/admin/feedbacks/${id}`, { method: "DELETE" });
};
