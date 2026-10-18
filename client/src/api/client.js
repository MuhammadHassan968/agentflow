/**
 * REST API Client for AgentFlow
 *
 * How this works:
 * In development, Vite's proxy (configured in vite.config.js) forwards any request
 * starting with '/api' to our Express server at 'http://localhost:5000'.
 *
 * This allows us to use relative URLs like '/api/health' without dealing with CORS
 * issues or hardcoding hostnames.
 */

const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Calls the backend GET /api/health endpoint
 * @returns {Promise<{success: boolean, data: {status: string, service: string, timestamp: string, uptimeSeconds: number, environment: string}}>}
 */
export async function getBackendHealth() {
  const url = `${API_BASE}/api/health`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `HTTP ${response.status}: Failed to reach backend`
    );
  }

  return response.json();
}
