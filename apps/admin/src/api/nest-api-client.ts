import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

type CsrfResponse = {
  csrfToken: string;
};

function getRawHeader(
  rawHeaders: string[] | undefined,
  name: string,
): string | undefined {
  if (!rawHeaders) {
    return undefined;
  }

  for (let i = 0; i < rawHeaders.length - 1; i += 2) {
    if (rawHeaders[i].toLowerCase() === name) {
      return rawHeaders[i + 1];
    }
  }

  return undefined;
}

export function getApiBaseUrl(): string {
  const apiBase = process.env.API_BASE_URL?.replace(/\/$/, '');
  if (!apiBase) {
    throw new Error('API_BASE_URL environment variable is not set');
  }

  return apiBase;
}

export class NestApiClient {
  private readonly client: AxiosInstance;
  private csrfToken?: string;

  private constructor(private readonly jar: CookieJar) {
    this.client = wrapper(
      axios.create({
        baseURL: getApiBaseUrl(),
        jar: this.jar,
        withCredentials: true,
      }),
    );
  }

  /**
   * Create a client using the cookies from the current Express request.
   *
   * IMPORTANT: create one per incoming request.
   */
  static async fromExpressRequest(req: any): Promise<NestApiClient> {
    const jar = new CookieJar();

    const client = new NestApiClient(jar);

    await client.importCookies(req); // we need the adminjs session cookie to be able to make requests to the API

    return client;
  }

  private async importCookies(request: { rawHeaders?: string[] }) {
    // AdminJS builds the ActionRequest via `Object.assign({}, req)` (see
    // @adminjs/express's buildRouter.js). On current Node, IncomingMessage#headers
    // is a lazily-computed accessor rather than an own property, so it is dropped
    // by that shallow copy — `request.headers` is never populated here. Only
    // `rawHeaders` (an own property, alternating name/value pairs) survives the
    // copy, so that's the only place to read the Cookie header from.
    const cookieHeader = getRawHeader(request.rawHeaders, 'cookie');

    if (!cookieHeader) {
      return;
    }

    const baseURL = this.client.defaults.baseURL!;

    // tough-cookie's setCookie parses Set-Cookie syntax (one cookie per call),
    // not the semicolon-joined Cookie header, so each pair must be set individually.
    for (const pair of cookieHeader.split(';')) {
      const trimmed = pair.trim();
      if (trimmed) {
        await this.jar.setCookie(trimmed, baseURL);
      }
    }
  }

  private async ensureCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    const response = await this.client.get<CsrfResponse>('/csrf-token');

    this.csrfToken = response.data.csrfToken;

    return this.csrfToken;
  }

  async get<T>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.client.get<T>(path, config);
  }

  async post<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const csrfToken = await this.ensureCsrfToken();

    return this.client.post<T>(path, data, {
      ...config,
      headers: {
        ...config?.headers,
        'x-csrf-token': csrfToken,
      },
    });
  }

  async put<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const csrfToken = await this.ensureCsrfToken();

    return this.client.put<T>(path, data, {
      ...config,
      headers: {
        ...config?.headers,
        'x-csrf-token': csrfToken,
      },
    });
  }

  async patch<T>(
    path: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const csrfToken = await this.ensureCsrfToken();

    return this.client.patch<T>(path, data, {
      ...config,
      headers: {
        ...config?.headers,
        'x-csrf-token': csrfToken,
      },
    });
  }

  async delete<T>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    const csrfToken = await this.ensureCsrfToken();

    return this.client.delete<T>(path, {
      ...config,
      headers: {
        ...config?.headers,
        'x-csrf-token': csrfToken,
      },
    });
  }
}
