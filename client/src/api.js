const jsonHeaders = { "Content-Type": "application/json" };

export async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...jsonHeaders,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed.");
  }

  if (response.status === 204) {
    return null;
  }
  return response.json();
}
