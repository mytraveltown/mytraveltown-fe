import type { AxiosRequestConfig } from "axios";
import api from "./api";

type RequestData = Record<string, unknown> | FormData;

export const GET = <T = unknown>(
  url: string,
  params: Record<string, unknown> = {}
) => api.get<T, T>(url, { params });

export const POST = <T = unknown>(
  url: string,
  data: RequestData = {},
  config: AxiosRequestConfig = {}
) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return api.post<T, T>(url, data, {
      ...config,
      headers: {},
    });
  }
  return api.post<T, T>(url, data, config);
};

export const PUT = <T = unknown>(
  url: string,
  data: RequestData = {},
  config: AxiosRequestConfig = {}
) => {
  if (typeof FormData !== "undefined" && data instanceof FormData) {
    return api.put<T, T>(url, data, {
      ...config,
      headers: {},
    });
  }
  return api.put<T, T>(url, data, config);
};

export const DELETE = <T = unknown>(url: string) => api.delete<T, T>(url);
