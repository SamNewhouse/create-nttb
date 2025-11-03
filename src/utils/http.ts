import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { NEXT_PUBLIC_API_URL } from "../config/variables";

/**
 * Create a reusable Axios HTTP client instance.
 * - Sets the base URL from your environment config.
 * - Configures request timeout and standard JSON headers.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: NEXT_PUBLIC_API_URL,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

/**
 * Makes an HTTP request using the shared Axios client.
 * Handles errors and always returns the data directly.
 *
 * @param config - Axios request config (method, url, data, params, etc).
 * @returns The response data, typed as generic T if provided.
 * @throws An object with `message` and `status` if the request fails.
 */
export async function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  try {
    // Execute the HTTP request using the client
    const response = await httpClient.request<T>(config);
    return response.data;
  } catch (error) {
    // Default error message and status
    let message = "HTTP error occurred";
    let status;
    // If the error is from Axios, parse for more details
    if (axios.isAxiosError(error)) {
      status = error.response?.status;
      message = error.response?.data?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    }
    // Throw standardized error object for consumption by your app
    throw { message, status };
  }
}
