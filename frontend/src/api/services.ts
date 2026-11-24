import type { AxiosInstance } from "axios";
import api from "./axios";
import type {
  EnrollmentRequest,
  EnrollmentResponse,
  LoginRequest,
  LoginResponse,
  PageResponse,
  RegisterRequest,
  RegisterResponse,
  Workshop,
  WorkshopDetail,
} from "../types";

// Rutas públicas: usan la instancia normal
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const res = await api.post<RegisterResponse>("/auth/register", data);
  return res.data;
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};

// Rutas protegidas: reciben la instancia de useAxiosForApi (ya lleva el token)
export const getWorkshops = async (http: AxiosInstance, page: number, size = 5): Promise<PageResponse<Workshop>> => {
  const res = await http.get<PageResponse<Workshop>>("/workshops", { params: { page, size } });
  return res.data;
};

export const getWorkshop = async (http: AxiosInstance, id: number): Promise<WorkshopDetail> => {
  const res = await http.get<WorkshopDetail>(`/workshops/${id}`);
  return res.data;
};

export const enroll = async (
  http: AxiosInstance,
  workshopId: number,
  data: EnrollmentRequest
): Promise<EnrollmentResponse> => {
  const res = await http.post<EnrollmentResponse>(`/workshops/${workshopId}/enrollments`, data);
  return res.data;
};
