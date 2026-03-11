import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";
import type { TokenResponse } from "@/lib/types";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
const AUTH_ENDPOINTS = ["/v1/auth/login/password", "/v1/auth/register", "/v1/auth/refresh"];

const isAuthEndpoint = (url?: string) => {
  const value = String(url ?? "");
  return AUTH_ENDPOINTS.some((path) => value.includes(path));
};

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (!isAuthEndpoint(config.url) && token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const authStore = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      authStore.refreshToken &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post<TokenResponse>(`${baseURL}/v1/auth/refresh`, {
          refreshToken: authStore.refreshToken,
        });

        authStore.setSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        });

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        authStore.clearSession();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { api, baseURL };
