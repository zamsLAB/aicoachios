import {
  PUBLIC_CLOUD_API_URL,
  getApiEndpointCandidates,
  joinApiUrl,
  apiFetch,
  apiFetchJson,
  apiUrl,
  getApiBaseUrl,
} from "./apiConfig";

export {
  PUBLIC_CLOUD_API_URL,
  getApiEndpointCandidates,
  joinApiUrl,
  apiFetch,
  apiFetchJson,
  apiUrl,
  getApiBaseUrl,
};

export const getApiBaseUrlCompat = (): string => getApiBaseUrl();


