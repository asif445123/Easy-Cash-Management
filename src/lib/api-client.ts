/**
 * Safely reads a fetch Response as JSON. Plain `res.json()` throws
 * "Unexpected end of JSON input" if the server ever returns an empty body
 * (a crashed API route, a proxy timeout, etc.) — this returns a sensible
 * fallback message instead of throwing, so the UI can always show
 * *something* useful rather than an unhandled runtime error.
 */
export async function safeJson(res: Response): Promise<{ message?: string; [key: string]: any }> {
  const text = await res.text();
  if (!text) {
    return { message: `Server returned an empty response (status ${res.status}).` };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: `Unexpected response from server (status ${res.status}).` };
  }
}
