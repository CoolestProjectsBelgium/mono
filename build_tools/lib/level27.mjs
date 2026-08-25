const DEFAULT_API_URL = 'https://api.level27.eu/v1';

/**
 * @param {{ appId: number, componentId: number, apiUrl?: string }} input
 */
export function restartRequest(input) {
  const base = (input.apiUrl ?? DEFAULT_API_URL).replace(/\/$/, '');
  return {
    url: `${base}/apps/${input.appId}/components/${input.componentId}/actions`,
    method: 'POST',
    body: { type: 'restart' },
  };
}

/**
 * @param {{ appId: number, componentId: number, apiKey: string, apiUrl?: string, fetchImpl?: typeof fetch }} input
 */
export async function restartComponent(input) {
  if (!input.apiKey) {
    throw new Error('LEVEL27_API_KEY is not set (needed to restart Node components).');
  }

  const request = restartRequest(input);
  const fetchImpl = input.fetchImpl ?? fetch;
  const response = await fetchImpl(request.url, {
    method: request.method,
    headers: {
      Authorization: input.apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request.body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Level27 restart failed (${response.status}) ${request.url}: ${text}`,
    );
  }
}
