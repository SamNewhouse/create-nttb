import { NextRequest } from "next/server";
import { sendError, sendNotFound, sendOk } from "../../../../utils/response";
import { User } from "../../../../types";

/**
 * GET /api/users/[id]
 *
 * Example of a dynamic route using a typed param and sendNotFound.
 * Replace with your own data lookup.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const users: User[] = [
      { id: 1, name: "Jane Doe", email: "jane@example.com" },
      { id: 2, name: "John Smith", email: "john@example.com" },
    ];

    const user = users.find((u) => u.id === Number(id));

    if (!user) {
      return sendNotFound(`User with id ${id} not found`);
    }

    return sendOk<User>(user);
  } catch (error: any) {
    return sendError(error.status, error.message || "Internal Server Error");
  }
}
