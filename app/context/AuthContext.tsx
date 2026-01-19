"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { authService, User } from "@/src/services/auth.service";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const user = await authService.getProfile();
      setUser(user);
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    }
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    const response = await authService.login({ email, password });

    if (!response.success) {
      throw new Error(response.message || "Login failed");
    }

    // Backend returns { success, message, data: { user, accessToken, refreshToken } }
    if (response.data && response.data.user) {
      setUser(response.data.user);
    } else {
      await checkAuth();
    }
  }

  async function signup(name: string, email: string, password: string) {
    const response = await authService.signup({ name, email, password });

    if (!response.success) {
      throw new Error(response.message || "Signup failed");
    }

    // After signup, user needs to verify email. User is NOT logged in yet.
    // The UI should handle redirect to OTP page
  }

  async function verifyEmail(email: string, otp: string) {
    const response = await authService.verifyOtp({ email, otp });

    if (!response.success) {
      throw new Error(response.message || "Verification failed");
    }

    // After verification, user typically needs to sign in manually
  }

  async function resendOtp(email: string) {
    const response = await authService.resendOtp({ email });

    if (!response.success) {
      throw new Error(response.message || "Failed to resend OTP");
    }
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    router.push("/login");
  }

  return (
    <AuthContext.Provider
      value={{ user, login, signup, logout, isLoading, verifyEmail, resendOtp }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
