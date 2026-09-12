/**
 * Base API URL resolver
 * - If running in a native mobile wrapper (Capacitor / Android WebView), requests point to the public live server.
 * - If running in web browser / Cloud Run preview, relative path ('') works automatically.
 */
export const BACKEND_URLS = [
  "https://ais-pre-f7yd3d2eeitc2scnmrrrkk-705997297622.asia-east1.run.app",
];

export const PUBLIC_CLOUD_API_URL = BACKEND_URLS[0];

export function getApiEndpointCandidates(): string[] {
  return [...BACKEND_URLS, ""];
}

export function joinApiUrl(endpoint: string, baseUrl = getApiBaseUrl()): string {
  if (!endpoint) return baseUrl;
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  return `${baseUrl}${endpoint}`;
}

export function getApiBaseUrl(): string {
  const isNative =
    typeof window !== "undefined" &&
    ((window as any).Capacitor?.isNativePlatform?.() ||
      window.location.protocol === "capacitor:" ||
      (window.location.hostname === "localhost" && window.location.port === ""));

  if (isNative) {
    // Return the production backend URL used by the released app.
    return BACKEND_URLS[0];
  }

  // Web Browser / Dev Preview default
  return "";
}

/**
 * Robust fetch with timeout for mobile / web resilience
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> {
  const url = joinApiUrl(endpoint);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export async function apiFetchJson<T = any>(endpoint: string, options: RequestInit = {}, timeoutMs = 6000): Promise<T> {
  const res = await apiFetch(endpoint, options, timeoutMs);
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

export const apiUrl = (endpoint: string): string => joinApiUrl(endpoint);
