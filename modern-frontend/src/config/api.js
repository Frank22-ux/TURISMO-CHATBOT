/**
 * Central API configuration
 *
 * In production (Render): the backend serves the frontend from the same origin,
 * so API_BASE = '' and all fetch calls become relative paths like /api/...
 *
 * In local development: VITE_API_URL = 'http://localhost:3000' (set in .env)
 * so fetch calls become http://localhost:3000/api/...
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
