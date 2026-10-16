const API_BASE_URL = (
  import.meta.env.API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");
const USERS_API_URL = API_BASE_URL.endsWith("/api/v1/users")
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1/users`;
const SESSION_EXPIRED_EVENT = "auth:session-expired";
let refreshRequest;

async function readResponse(response) {
  const isJsonResponse = response.headers
    .get("content-type")
    ?.includes("application/json");
  const result = isJsonResponse ? await response.json() : null;

  if (!response.ok || !result?.success) {
    const error = new Error(
      result?.message || "Unable to complete your request. Please try again."
    );
    error.status = response.status;
    throw error;
  }

  return result.data;
}

async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${USERS_API_URL}/refresh-token`, {
      method: "POST",
      credentials: "include",
    })
      .then(readResponse)
      .catch((error) => {
        if (error.status === 401) {
          window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        }
        throw error;
      })
      .finally(() => {
        refreshRequest = undefined;
      });
  }

  return refreshRequest;
}

async function request(endpoint, { method = "GET", body, authenticated = false } = {}) {
  const url = `${USERS_API_URL}/${endpoint}`;
  const options = {
    method,
    credentials: "include",
    ...(body === undefined
      ? {}
      : {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
  };
  let response = await fetch(url, options);

  if (response.status === 401 && authenticated) {
    await refreshSession();
    response = await fetch(url, options);
    if (response.status === 401) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
  }

  return readResponse(response);
}

export function registerUser(userData) {
  return request("register", { method: "POST", body: userData });
}

export function verifyEmail(token) {
  return request(`verify-email?token=${encodeURIComponent(token)}`);
}

export function loginUser(userData) {
  return request("login", { method: "POST", body: userData });
}

export function getCurrentUser() {
  return request("current-user", { authenticated: true });
}

export function logoutUser() {
  return request("logout", { method: "POST", authenticated: true });
}
