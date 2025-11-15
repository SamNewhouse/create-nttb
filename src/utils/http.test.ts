import axios from "axios";

jest.mock("axios");

const mockRequest = jest.fn();

(axios.create as jest.Mock).mockReturnValue({
  request: mockRequest,
  defaults: {
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 5000,
    headers: { "Content-Type": "application/json" },
  },
});

(axios.isAxiosError as unknown as jest.Mock).mockImplementation((err) => err.isAxiosError === true);

import { httpClient, request } from "./http";

describe("httpClient and request", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockRequest.mockReset();
  });

  it("httpClient should have correct defaults", () => {
    expect(httpClient.defaults.baseURL).toBe(process.env.NEXT_PUBLIC_API_URL);
    expect(httpClient.defaults.timeout).toBe(5000);
    expect(httpClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  describe("request success", () => {
    it("should return data when request is successful", async () => {
      const mockData = { foo: "bar" };
      mockRequest.mockResolvedValueOnce({ data: mockData });

      const result = await request({ url: "/test", method: "GET" });
      expect(result).toEqual(mockData);
      expect(mockRequest).toHaveBeenCalledWith({ url: "/test", method: "GET" });
    });
  });

  describe("request errors", () => {
    it("should throw standardized error object when request fails with axios error", async () => {
      const axiosError = {
        isAxiosError: true,
        response: { status: 404, data: { message: "Not Found" } },
        message: "Request failed",
      };
      mockRequest.mockRejectedValueOnce(axiosError);

      await expect(request({ url: "/fail", method: "GET" })).rejects.toEqual({
        message: "Not Found",
        status: 404,
      });
    });

    it("should throw standardized error object for non-axios error", async () => {
      const error = new Error("Some error");
      mockRequest.mockRejectedValueOnce(error);

      await expect(request({ url: "/fail", method: "GET" })).rejects.toEqual({
        message: "Some error",
        status: undefined,
      });
    });
  });
});
