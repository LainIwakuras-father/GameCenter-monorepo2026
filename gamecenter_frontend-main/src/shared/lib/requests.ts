import { sessionExpired } from "./session";

const configuredApiUrl = String(import.meta.env.VITE_API_URL ?? "").trim();
const API_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://localhost:8000/api" : "/api")
).replace(/\/+$/, "");

const currentOrigin = () =>
  typeof window !== "undefined" ? window.location.origin : "";

const API_ORIGIN = (() => {
  try {
    // A relative `/api` endpoint belongs to the same origin as the page.
    // Supplying the page origin as a base also keeps this module safe in the
    // production reverse-proxy setup where VITE_API_URL is usually relative.
    return new URL(API_URL, currentOrigin() || "http://localhost").origin;
  } catch {
    return currentOrigin();
  }
})();

/** URL of the separate FastAdmin interface for the current API deployment. */
export const getAdminUrl = () => `${API_ORIGIN || currentOrigin()}/admin/`;

const defaultHeaders: HeadersInit = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

type Method = "GET" | "POST";

interface RequestInfo {
  url: string;
  method: Method;
  body?: string;
  canRefresh: boolean;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, payload: unknown) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export const getErrorMessage = (
  error: unknown,
  fallback = "Не удалось загрузить данные",
) => {
  if (error instanceof ApiError) {
    const payload = error.payload;
    if (
      typeof payload === "object" &&
      payload !== null &&
      "detail" in payload &&
      typeof payload.detail === "string"
    ) {
      return payload.detail;
    }

    if (error.status >= 500) {
      return "Сервер временно недоступен. Повторите попытку чуть позже";
    }

    if (error.status === 403) {
      return "Недостаточно прав для этого действия";
    }

    // Never expose transport-oriented messages such as
    // "API request failed with status …" in the interface.
    return fallback;
  }

  // Browsers expose connection failures as a generic TypeError.  Keep that
  // implementation detail out of the UI and give the user an actionable
  // message instead.
  if (
    error instanceof TypeError &&
    /fetch|network|load failed/i.test(error.message)
  ) {
    return "Сервер временно недоступен. Проверьте подключение и повторите попытку";
  }

  return error instanceof Error && error.message ? error.message : fallback;
};

export const getMediaUrl = (value: string | null | undefined) => {
  if (!value) {
    return "";
  }

  // Media returned by the API may be an absolute URL or a local static path.
  // Do not turn arbitrary data URLs into executable image sources.
  if (/^(?:https?:|blob:)/i.test(value)) {
    return value;
  }

  return API_ORIGIN + "/" + value.replace(/^\/+/, "");
};

const normalizePath = (path: string) =>
  `${API_URL}/${path.replace(/^\/+|\/+$/g, "")}`;

const getHeaders = (): HeadersInit => {
  const accessToken = localStorage.getItem("access_token");
  return {
    ...defaultHeaders,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

const parsePayload = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

export const setAuthToken = (accessToken: string) => {
  localStorage.setItem("access_token", accessToken);
};

export const removeAuthToken = () => {
  localStorage.removeItem("access_token");
};

let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch(normalizePath("/token/refresh"), {
      method: "POST",
      headers: defaultHeaders,
      credentials: "include",
    });

    const payload = await parsePayload(response);
    if (!response.ok || typeof payload !== "object" || payload === null) {
      throw new ApiError(response.status, payload);
    }

    const access = (payload as { access?: unknown }).access;
    if (typeof access !== "string" || access.length === 0) {
      throw new Error("Invalid token refresh response");
    }

    setAuthToken(access);
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const handleResponse = async (
  response: Response,
  requestInfo: RequestInfo,
): Promise<unknown> => {
  const payload = await parsePayload(response);
  if (response.ok) {
    return payload;
  }

  if (response.status === 401 && requestInfo.canRefresh) {
    try {
      await refreshAccessToken();
      const retryResponse = await fetch(requestInfo.url, {
        method: requestInfo.method,
        headers: getHeaders(),
        body: requestInfo.body,
        credentials: "include",
      });

      return handleResponse(retryResponse, {
        ...requestInfo,
        canRefresh: false,
      });
    } catch (error) {
      // A temporary network outage must not log the user out.  Expire the
      // local session only when the refresh endpoint explicitly rejects the
      // cookie/token (or returns an invalid non-network response).
      const isNetworkError =
        error instanceof TypeError &&
        /fetch|network|load failed/i.test(error.message);
      const isTransientServerError =
        error instanceof ApiError && error.status >= 500;
      if (!isNetworkError && !isTransientServerError) {
        removeAuthToken();
        sessionExpired();
      }
      if (error instanceof ApiError || isNetworkError) {
        throw error;
      }
      throw new Error("Unauthorized");
    }
  }

  throw new ApiError(response.status, payload);
};

const request = async (path: string, method: Method, body?: unknown) => {
  const serializedBody = body === undefined ? undefined : JSON.stringify(body);
  const url = normalizePath(path);
  const response = await fetch(url, {
    method,
    headers: getHeaders(),
    body: serializedBody,
    credentials: "include",
  });

  return handleResponse(response, {
    url,
    method,
    body: serializedBody,
    canRefresh: !path.includes("/token"),
  });
};

export const get = (path: string) => request(path, "GET");

export const post = (path: string, body?: unknown) =>
  request(path, "POST", body);

export const postNoBody = (path: string) => request(path, "POST");

export const postWithQuery = (
  path: string,
  queryParams: Record<string, string>,
) => {
  const query = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    query.set(key, value);
  });

  return request(`${path.replace(/\/+$/, "")}?${query.toString()}`, "POST");
};
