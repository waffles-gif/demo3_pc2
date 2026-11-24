export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface Workshop {
  id: number;
  name: string;
  discipline: string;
  date: string;
  vacancies: number;
}

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface Session {
  id: number;
  startsAt: string;
  vacancies: number;
}

export interface WorkshopDetail extends Workshop {
  sessions: Session[];
}

export type ExperienceLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface EnrollmentRequest {
  sessionId: number;
  experienceLevel: ExperienceLevel;
}

export interface EnrollmentResponse {
  sessionId: number;
  experienceLevel: ExperienceLevel;
}
