import { createContext, useContext, type ReactNode } from "react";
import axios, { type AxiosInstance } from "axios";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { API_HOST, TOKEN_KEY, handleUnauthorized } from "../api/axios";
import * as authService from "../api/services";
import type { LoginRequest } from "../types";

interface AuthContextType {
  token: string;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useLocalStorage(TOKEN_KEY, "");

  const login = async (data: LoginRequest) => {
    const res = await authService.login(data);
    setToken(res.token);
  };

  const logout = () => {
    setToken("");
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};

// Instancia de axios con el token del usuario logueado, para las rutas protegidas
// eslint-disable-next-line react-refresh/only-export-components
export const useAxiosForApi = (): [AxiosInstance] => {
  const auth = useAuth();
  if (!auth.token) {
    throw new Error("No auth token available. This hook cannot be used outside of an authenticated context.");
  }
  const instance = axios.create({ baseURL: API_HOST, headers: { Authorization: "Bearer " + auth.token } });
  instance.interceptors.response.use((response) => response, handleUnauthorized);
  return [instance];
};
