import type { User } from "@/types";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function saveUser(user: User) {
  localStorage.setItem("token", user.token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn(): boolean {
  return !!getUser();
}
