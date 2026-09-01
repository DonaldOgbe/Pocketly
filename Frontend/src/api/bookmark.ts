import type { Bookmark } from "../types/bookmark";

const API_BASE_URL = "http://localhost:3000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const response = await fetch(`${API_BASE_URL}/bookmarks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status}`);
  }

  return response.json();
}