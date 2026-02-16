export interface AuthUser {
  username: string;
  role: string;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data?: AuthUser;
  error?: string;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  data?: {
    username: string;
    role: string;
  };
  error?: string;
}