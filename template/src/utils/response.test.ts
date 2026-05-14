import { NextResponse } from "next/server";
import {
  sendOk,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendNotFound,
  sendMethodNotAllowed,
  sendError,
} from "./response";

async function json(res: NextResponse) {
  return res.json();
}

describe("sendOk()", () => {
  it("returns status 200 with data", async () => {
    const res = sendOk({ id: 1 });
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ id: 1 });
  });
});

describe("sendCreated()", () => {
  it("returns status 201 with data", async () => {
    const res = sendCreated({ id: 2 });
    expect(res.status).toBe(201);
    expect(await json(res)).toEqual({ id: 2 });
  });
});

describe("sendNoContent()", () => {
  it("returns status 204 with no body", async () => {
    const res = sendNoContent();
    expect(res.status).toBe(204);
    expect(res.body).toBeNull();
  });
});

describe("sendBadRequest()", () => {
  it("returns status 400 with default message", async () => {
    const res = sendBadRequest();
    expect(res.status).toBe(400);
    expect(await json(res)).toEqual({ error: "Bad Request" });
  });

  it("returns status 400 with custom message", async () => {
    const res = sendBadRequest("Invalid email");
    expect(res.status).toBe(400);
    expect(await json(res)).toEqual({ error: "Invalid email" });
  });
});

describe("sendNotFound()", () => {
  it("returns status 404 with default message", async () => {
    const res = sendNotFound();
    expect(res.status).toBe(404);
    expect(await json(res)).toEqual({ error: "Not Found" });
  });

  it("returns status 404 with custom message", async () => {
    const res = sendNotFound("User not found");
    expect(res.status).toBe(404);
    expect(await json(res)).toEqual({ error: "User not found" });
  });
});

describe("sendMethodNotAllowed()", () => {
  it("returns status 405 with default allowed methods", async () => {
    const res = sendMethodNotAllowed();
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET");
    expect(await json(res)).toEqual({
      error: "Method not allowed. Allowed: GET",
    });
  });

  it("returns status 405 with custom allowed methods", async () => {
    const res = sendMethodNotAllowed(["GET", "POST"]);
    expect(res.status).toBe(405);
    expect(res.headers.get("Allow")).toBe("GET, POST");
    expect(await json(res)).toEqual({
      error: "Method not allowed. Allowed: GET, POST",
    });
  });
});

describe("sendError()", () => {
  it("returns status 500 with default message", async () => {
    const res = sendError();
    expect(res.status).toBe(500);
    expect(await json(res)).toEqual({ error: "Internal Server Error" });
  });

  it("returns status 503 with custom message", async () => {
    const res = sendError(503, "Service unavailable");
    expect(res.status).toBe(503);
    expect(await json(res)).toEqual({ error: "Service unavailable" });
  });
});
