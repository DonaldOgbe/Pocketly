import { API_BASE_URL } from "./client";

type LoginResponse = {
  token: string;
  user: { id: string; email: string };
};

type RegisterResponse = {
  user: { id: string; email: string; createdAt: string };
};

async function parseErrorMessage(response: Response): Promise<string> {
  const body = await response.json().catch(() => null);
  return body?.error ?? `Request failed: ${response.status}`;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function register(email: string, password: string): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const token = localStorage.getItem("token");
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  localStorage.removeItem("token");
}