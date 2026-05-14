import { NextResponse } from "next/server";

/**
 * Sends a 200 OK response with the provided data as JSON.
 *
 * @param data - The payload to send as JSON.
 * @returns A {@link NextResponse} with status 200.
 *
 * @example
 * return sendOk({ id: 1, name: "Test" });
 */
export function sendOk<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 200 });
}

/**
 * Sends a 201 Created response with the provided data as JSON.
 *
 * @param data - The newly created resource payload.
 * @returns A {@link NextResponse} with status 201.
 *
 * @example
 * return sendCreated({ id: 2, name: "New" });
 */
export function sendCreated<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

/**
 * Sends a 204 No Content response with an empty body.
 *
 * @returns A {@link NextResponse} with status 204 and no body.
 *
 * @example
 * return sendNoContent();
 */
export function sendNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Sends a 400 Bad Request response with a custom error message.
 *
 * @param message - Error message to send (default: `"Bad Request"`).
 * @returns A {@link NextResponse} with status 400.
 *
 * @example
 * return sendBadRequest("Invalid email address");
 */
export function sendBadRequest(message = "Bad Request"): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Sends a 404 Not Found response with a custom error message.
 *
 * @param message - Error message to send (default: `"Not Found"`).
 * @returns A {@link NextResponse} with status 404.
 *
 * @example
 * return sendNotFound("User not found");
 */
export function sendNotFound(message = "Not Found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * Sends a 405 Method Not Allowed response with the correct `Allow` header.
 *
 * @param allowed - Array of allowed HTTP methods (default: `["GET"]`).
 * @returns A {@link NextResponse} with status 405 and an `Allow` header.
 *
 * @example
 * return sendMethodNotAllowed(["GET", "POST"]);
 */
export function sendMethodNotAllowed(allowed: string[] = ["GET"]): NextResponse {
  return NextResponse.json(
    { error: `Method not allowed. Allowed: ${allowed.join(", ")}` },
    { status: 405, headers: { Allow: allowed.join(", ") } },
  );
}

/**
 * Sends a custom error response with the given status code and message.
 *
 * @param status - HTTP status code (default: `500`).
 * @param message - Error message (default: `"Internal Server Error"`).
 * @returns A {@link NextResponse} with the given status.
 *
 * @example
 * return sendError(503, "Service temporarily unavailable");
 */
export function sendError(status = 500, message = "Internal Server Error"): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
