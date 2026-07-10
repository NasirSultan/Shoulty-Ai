const API_BASE = "https://ai-shoutly-backend.onrender.com/api/autopost";

function authHeaders() {
  const token = localStorage.getItem("shoutly_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/** Kicks off OAuth for a platform. `network` must be one of the backend's
 * supported values: "facebook" | "instagram" | "linkedin" | "youtube" (connect-only, do not use for now).
 * Returns the Outstand redirect URL — caller should `window.location.href = redirectUrl`.
 */
export async function getConnectUrl(network: string): Promise<{ redirectUrl: string }> {
  const res = await fetch(`${API_BASE}/connect`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ platform: network }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch authorization URL");
  return data;
}

/** Which platforms are connected + basic account info per platform. */
export async function getConnectionStatus() {
  const res = await fetch(`${API_BASE}/connection-status`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch connection status");
  return res.json();
}

/** Per-platform followers/reach/engagement + top-level totals. */
export async function getAccountsOverview() {
  const res = await fetch(`${API_BASE}/accounts-overview`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch accounts overview");
  return res.json();
}

/** Finalizes an OAuth redirect. Pass sessionToken for Facebook,
 * or account_id/network_unique_id/username/network for Instagram/LinkedIn.
 */
export async function handlePlatformCallback(payload: {
  sessionToken?: string;
  account_id?: string;
  network_unique_id?: string;
  username?: string;
  network?: string;
}) {
  const res = await fetch(`${API_BASE}/handle-callback`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to finalize connection");
  return data;
}