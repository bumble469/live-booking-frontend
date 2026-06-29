const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

if (import.meta.env.DEV && !BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set — API calls will use relative paths');
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((error as { error: string }).error ?? `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}