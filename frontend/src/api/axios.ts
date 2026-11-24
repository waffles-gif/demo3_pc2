import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../types";

export const API_HOST = "http://localhost:3002/api";
export const TOKEN_KEY = "token";

const api = axios.create({
  baseURL: API_HOST,
  headers: { "Content-Type": "application/json" },
});

// Si el servidor responde con 401 (No autorizado) limpiamos la sesión y vamos al login.
// En /auth/login un 401 solo significa credenciales incorrectas, eso lo muestra la página.
export const handleUnauthorized = (error: AxiosError<ApiError>) => {
  const isAuthRequest = error.config?.url?.startsWith("/auth/");

  if (error.response?.status === 401 && !isAuthRequest) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return Promise.reject(error);
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener el token guardado en localStorage
    const token = localStorage.getItem(TOKEN_KEY);
    // Si existe un token, agregarlo al header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use((response) => response, handleUnauthorized);

export default api;
