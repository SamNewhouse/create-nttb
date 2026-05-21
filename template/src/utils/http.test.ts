import { HttpError, request } from "./http";
import { NEXT_PUBLIC_API_URL } from "../config/variables";

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockUrl = (path: string) => `${NEXT_PUBLIC_API_URL}${path}`;

function mockResponse(body: unknown, status = 200, ok = true): Response {
  return {
    ok,
    status,
    statusText: ok ? "OK" : "Error",
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe("request()", () => {
  describe("successful responses", () => {
    it("returns parsed JSON for a 200 response", async () => {
      mockFetch.mockResolvedValue(mockResponse({ id: 1 }));
      expect(await request("/test")).toEqual({ id: 1 });
    });

    it("calls fetch with the correct URL and default headers", async () => {
      mockFetch.mockResolvedValue(mockResponse({}));

      await request("/users");

      expect(mockFetch).toHaveBeenCalledWith(
        mockUrl("/users"),
        expect.objectContaining({
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    it("merges custom headers with default headers", async () => {
      mockFetch.mockResolvedValue(mockResponse({}));

      await request("/users", { headers: { Authorization: "Bearer token" } });

      expect(mockFetch).toHaveBeenCalledWith(
        mockUrl("/users"),
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer token",
          },
        }),
      );
    });

    it("passes method and body options through to fetch", async () => {
      const body = JSON.stringify({ name: "Test" });
      mockFetch.mockResolvedValue(mockResponse({ id: 1 }, 201, true));

      await request("/users", { method: "POST", body });

      expect(mockFetch).toHaveBeenCalledWith(
        mockUrl("/users"),
        expect.objectContaining({ method: "POST", body }),
      );
    });

    it("includes AbortSignal.timeout in the request", async () => {
      mockFetch.mockResolvedValue(mockResponse({}));

      await request("/users");

      const [, options] = mockFetch.mock.calls[0];
      expect(options.signal).toBeDefined();
    });
  });

  describe("error responses", () => {
    it("throws HttpError with status and message from response body", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ message: "Not found" }, 404, false),
      );

      await expect(request("/missing")).rejects.toMatchObject({
        name: "HttpError",
        status: 404,
        message: "Not found",
      });
    });

    it("throws HttpError with statusText when body has no message", async () => {
      mockFetch.mockResolvedValue(mockResponse({}, 500, false));

      await expect(request("/error")).rejects.toMatchObject({
        name: "HttpError",
        status: 500,
        message: "Error",
      });
    });

    it("throws HttpError when response body is not valid JSON", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        statusText: "Service Unavailable",
        json: jest.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
      } as unknown as Response);

      await expect(request("/down")).rejects.toMatchObject({
        name: "HttpError",
        status: 503,
        message: "Service Unavailable",
      });
    });

    it("HttpError is an instance of Error", async () => {
      mockFetch.mockResolvedValue(
        mockResponse({ message: "Unauthorized" }, 401, false),
      );

      await expect(request("/secure")).rejects.toBeInstanceOf(HttpError);
      await expect(request("/secure")).rejects.toBeInstanceOf(Error);
    });

    it("propagates network errors directly", async () => {
      mockFetch.mockRejectedValue(new TypeError("Failed to fetch"));

      await expect(request("/network-fail")).rejects.toThrow("Failed to fetch");
    });

    it("throws TimeoutError when the request exceeds 5 seconds", async () => {
      mockFetch.mockRejectedValue(
        new DOMException("signal timed out", "TimeoutError"),
      );

      await expect(request("/slow")).rejects.toThrow("signal timed out");
      await expect(request("/slow")).rejects.toMatchObject({
        name: "TimeoutError",
      });
    });
  });
});
