const productionApiUrl = "https://oneapp-practice-vtu-backend.onrender.com";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? productionApiUrl : productionApiUrl);

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
