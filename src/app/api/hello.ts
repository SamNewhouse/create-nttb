import type { NextApiRequest, NextApiResponse } from "next";
import { Data } from "../../types";
import { request } from "../../utils/http";
import { sendOk, sendMethodNotAllowed, sendError } from "../../utils/response";

/**
 * API route handler example.
 *
 * - Use as a base for any new endpoint: simply add more methods/logic as needed.
 * - `sendOk`, `sendMethodNotAllowed`, and `sendError` helpers make code more readable and avoid repeated status logic.
 * - See below for both internal/static and proxied/external response patterns.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    if (req.method === "GET") {
      // To fetch data from an external/internal API, uncomment the next two lines and supply your endpoint:
      // const apiResponse = await request<Data>({ method: "get", url: "/your-api-endpoint" });
      // return sendOk(res, apiResponse);

      // Otherwise, just return a static local response (useful for prototyping):
      return sendOk(res, { message: "Hello from API!" });
    }

    // Handles unsupported HTTP methods with consistent error structure and "Allow" header
    return sendMethodNotAllowed(res, ["GET"]);
  } catch (error: any) {
    // All thrown errors flow here for a standardized error response
    return sendError(res, error.status, error.message || "Internal Server Error");
  }
}
