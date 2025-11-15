import type { NextApiResponse } from "next";
import { sendOk, sendMethodNotAllowed, sendBadRequest, sendError, sendNotFound } from "./response";

function createResMock() {
  let statusCode: number | undefined;
  let jsonData: any;
  let headers: Record<string, any> = {};

  const res = {
    setHeader: jest.fn((key: string, value: any) => {
      headers[key] = value;
    }),
    status: jest.fn(function (code: number) {
      statusCode = code;
      return this;
    }),
    json: jest.fn(function (data: any) {
      jsonData = data;
      return this;
    }),
  } as unknown as NextApiResponse;

  return {
    res,
    get statusCode() {
      return statusCode;
    },
    get jsonData() {
      return jsonData;
    },
    headers,
  };
}

describe("response helpers", () => {
  test("sendOk sends 200 and JSON data", () => {
    const { res, statusCode, jsonData } = createResMock();
    sendOk(res, { ok: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("sendMethodNotAllowed sends 405 and sets Allow header (default)", () => {
    const { res, statusCode, jsonData, headers } = createResMock();
    sendMethodNotAllowed(res);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", ["GET"]);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "Method GET only" });
    expect(headers.Allow).toEqual(["GET"]);
  });

  test("sendMethodNotAllowed allows custom methods", () => {
    const { res, headers } = createResMock();
    sendMethodNotAllowed(res, ["DELETE", "POST"]);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", ["DELETE", "POST"]);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: "Method DELETE, POST only" });
    expect(headers.Allow).toEqual(["DELETE", "POST"]);
  });

  test("sendBadRequest sends 400 and default error", () => {
    const { res } = createResMock();
    sendBadRequest(res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Bad Request" });
  });

  test("sendBadRequest sends custom error", () => {
    const { res } = createResMock();
    sendBadRequest(res, "custom bad");
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "custom bad" });
  });

  test("sendError sends custom error and status", () => {
    const { res } = createResMock();
    sendError(res, 409, "conflict");
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: "conflict" });
  });

  test("sendError sends default error for no args", () => {
    const { res } = createResMock();
    sendError(res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

  test("sendNotFound sends 404 and default error", () => {
    const { res } = createResMock();
    sendNotFound(res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Not Found" });
  });

  test("sendNotFound sends 404 and custom error", () => {
    const { res } = createResMock();
    sendNotFound(res, "nope");
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "nope" });
  });
});
