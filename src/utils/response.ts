import type { NextApiResponse } from "next";

/**
 * Sends a 200 OK response with the provided data.
 * @param res - The Next.js API response object.
 * @param data - The payload to send as JSON.
 */
export function sendOk<T>(res: NextApiResponse<T>, data: T) {
  return res.status(200).json(data);
}

/**
 * Sends a 405 Method Not Allowed response with an error message and correct Allow header.
 * @param res - The Next.js API response object.
 * @param allowed - Array of allowed HTTP methods (default: ["GET"]).
 */
export function sendMethodNotAllowed(res: NextApiResponse, allowed: string[] = ["GET"]) {
  res.setHeader("Allow", allowed);
  return res.status(405).json({ error: `Method ${allowed.join(", ")} only` });
}

/**
 * Sends a 400 Bad Request response with a custom error message.
 * @param res - The Next.js API response object.
 * @param message - Error message to send (default: "Bad Request").
 */
export function sendBadRequest(res: NextApiResponse, message = "Bad Request") {
  return res.status(400).json({ error: message });
}

/**
 * Sends a custom error response with the given status and error message.
 * @param res - The Next.js API response object.
 * @param status - HTTP status code (default: 500).
 * @param message - Error message (default: "Internal Server Error").
 */
export function sendError(res: NextApiResponse, status = 500, message = "Internal Server Error") {
  return res.status(status).json({ error: message });
}

/**
 * Sends a 404 Not Found response with a custom error message.
 * @param res - The Next.js API response object.
 * @param message - Error message to send (default: "Not Found").
 */
export function sendNotFound(res: NextApiResponse, message = "Not Found") {
  return res.status(404).json({ error: message });
}
