import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bato-backend-a9x8.onrender.com";

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role?: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    accessToken?: string;
    refreshToken?: string;
  };
}

class AuthService {
  private getAuthHeaders() {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
    return response.data.user;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, data, {
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
    return response.data;
  }

  /**
   * Sign up new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/signup`, data, {
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
    return response.data;
  }

  /**
   * Verify email with OTP
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/verifyOtp`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Resend OTP to email
   */
  async resendOtp(data: ResendOtpRequest): Promise<AuthResponse> {
    const response = await axios.post(`${API_BASE_URL}/auth/resendOtp`, data, {
      headers: this.getAuthHeaders(),
    });
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/auth/logout`,
      {},
      {
        headers: this.getAuthHeaders(),
        withCredentials: true,
      },
    );
  }
}

export const authService = new AuthService();
