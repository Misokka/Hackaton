const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export function getApiBaseUrl() {
  const publicBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const internalBaseUrl = process.env.API_INTERNAL_BASE_URL;

  const baseUrl = typeof window === "undefined"
    ? (internalBaseUrl ?? publicBaseUrl)
    : publicBaseUrl;

  if (!baseUrl) {
    throw new Error("API base URL is not configured");
  }

  return trimTrailingSlash(baseUrl);
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}
