import { NextRequest } from "next/server";
import {
  sendBadRequest,
  sendCreated,
  sendError,
  sendOk,
} from "../../../utils/response";
import { User, CreateUserBody } from "../../../types";

/**
 * GET /api/users
 *
 * Example of returning a typed list with sendOk.
 * Replace with your own data source.
 */
export async function GET(_req: NextRequest) {
  try {
    const users: User[] = [
      { id: 1, name: "Jane Doe", email: "jane@example.com" },
      { id: 2, name: "John Smith", email: "john@example.com" },
    ];
    return sendOk<User[]>(users);
  } catch (error: any) {
    return sendError(error.status, error.message || "Internal Server Error");
  }
}

/**
 * POST /api/users
 *
 * Example of parsing a typed request body and returning 201 Created.
 * Replace with your own creation logic.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateUserBody;

    if (!body.name || !body.email) {
      return sendBadRequest("name and email are required");
    }

    const created: User = { id: 3, ...body };
    return sendCreated<User>(created);
  } catch (error: any) {
    return sendError(error.status, error.message || "Internal Server Error");
  }
}
