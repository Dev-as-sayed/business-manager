const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"
).replace(/\/$/, "");

export { API_URL };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!res.ok) return null;

        const json = await res.json();
        const token = json?.data?.accessToken;
        if (typeof token !== "string" || !token) return null;

        localStorage.setItem("token", token);
        return token;
      } catch {
        return null;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> => {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (
    res.status === 401 &&
    retry &&
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/refresh")
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, options, false);
  }

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? "Request failed", res.status);
  }

  return (json?.data ?? json) as T;
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? "Login failed", res.status);
  }

  return json.data as {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    accessToken: string;
  };
};

export const logout = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
  } catch {
    // Local session is cleared regardless of the network result.
  }
};
