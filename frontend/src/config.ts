export const APP_NAME = "StockFlow WMS";

// In development, Vite dev server proxies /api to http://127.0.0.1:8000/api.
// In production on Vercel, requests to /api are handled by the serverless backend via vercel.json.
// If VITE_API_URL is explicitly set (e.g. separate backend deployment), use it.
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

