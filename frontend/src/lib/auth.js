const AUTH_UPDATED_EVENT = "authUpdated";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem("access_token");
}

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem("user_info");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("access_token", token);
  window.sessionStorage.setItem("user_info", JSON.stringify(user));
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("user_info");
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function updateAuthUser(user) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem("user_info", JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("access_token");
  window.sessionStorage.removeItem("user_info");
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("user_info");
  window.dispatchEvent(new Event(AUTH_UPDATED_EVENT));
}

export function addAuthListener(listener) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(AUTH_UPDATED_EVENT, listener);
  return () => window.removeEventListener(AUTH_UPDATED_EVENT, listener);
}
