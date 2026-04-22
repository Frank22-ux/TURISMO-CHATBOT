/**
 * Central API configuration — Vercel (Frontend) + Render (Backend)
 *
 * VITE_API_URL must be set in:
 *   - Local:   modern-frontend/.env  → VITE_API_URL=http://localhost:3000
 *   - Vercel:  Environment Variables → VITE_API_URL=https://your-app.onrender.com
 *
 * Since the frontend (Vercel) and backend (Render) are on different domains,
 * VITE_API_URL is ALWAYS required — there is no "same-origin" fallback.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

if (!import.meta.env.VITE_API_URL) {
    console.warn('[API] VITE_API_URL is not set. API calls will use relative paths (only works if backend serves the frontend).');
}
