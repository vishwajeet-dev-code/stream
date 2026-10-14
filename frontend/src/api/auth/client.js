const API_BASE_URL = import.meta.env.API_BASE_URL.replace(/\/+$/, "");
const USERS_API_URL = API_BASE_URL.endsWith("/api/v1/users")
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1/users`;

export async function postAuthRequest(endpoint, userData) {
  const response = await fetch(
    `${USERS_API_URL}/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );
  const isJsonResponse = response.headers
    .get("content-type")
    ?.includes("application/json");
  const result = isJsonResponse ? await response.json() : null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || "Unable to complete your request. Please try again."
    );
  }

  return result.data;
}

export function registerUser(userData) {
  return postAuthRequest("register", userData);
}

export function loginUser(userData) {
  return postAuthRequest("login", userData);
}