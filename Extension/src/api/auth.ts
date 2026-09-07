import { API_BASE_URL, setToken } from "./client";

type LoginResponse = {
  token: string;
  user: { id: string; email: string };
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

  const data: LoginResponse = await response.json();
  await setToken(data.token);
  return data;
}