import { NEXT_PUBLIC_API_URL } from "../config/variables";

/**
 * Represents an HTTP error returned from a failed request.
 */
export class HttpError extends Error {
  public readonly status: number | undefined;

  constructor(status: number | undefined, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * Makes an HTTP request using the native fetch API.
 *
 * Automatically prepends the base API URL from environment config,
 * sets JSON content headers, and throws an {@link HttpError} for
 * non-2xx responses with the status code and error message from the body.
 *
 * Requests time out after 5 seconds via {@link AbortSignal.timeout}.
 *
 * @param path - The API path to append to the base URL (e.g. `/users/1`).
 * @param options - Standard {@link RequestInit} fetch options (method, body, headers, etc).
 * @returns The parsed JSON response body typed as `T`.
 * @throws {@link HttpError} if the response status is not ok, or if the network fails.
 * @throws {@link DOMException} with name `"TimeoutError"` if the request exceeds 5 seconds.
 *
 * @example
 * const user = await request<User>("/users/1");
 * const created = await request<User>("/users", { method: "POST", body: JSON.stringify(data) });
 */
export async function request<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const url = `${NEXT_PUBLIC_API_URL}${path}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(5000),
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new HttpError(response.status, body?.message ?? response.statusText);
  }

  return response.json() as Promise<T>;
}
