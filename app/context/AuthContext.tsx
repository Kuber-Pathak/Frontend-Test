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

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role?: string;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      // Check if access token cookie exists (client-side check strictly for UI state initialization)
      // Real validation happens via API call
      // const accessToken = Cookies.get("accessToken");

      // Call profile endpoint to validate session (uses cookie)
      const res = await fetch(`${API_URL}/auth/profile`, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.user) {
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    }
    setIsLoading(false);
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Important for receiving cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Backend returns { success, message, data: { user, accessToken, refreshToken } }
    if (data.data && data.data.user) {
      setUser(data.data.user);
    } else {
      await checkAuth();
    }
  }

  async function signup(name: string, email: string, password: string) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Signup failed");
    }

    // After signup, user needs to verify email. User is NOT logged in yet.
    // The UI should handle redirect to OTP page
  }

  async function verifyEmail(email: string, otp: string) {
    const res = await fetch(`${API_URL}/auth/verifyOtp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Verification failed");
    }

    // After verification, user typically needs to sign in manually
  }

  async function resendOtp(email: string) {
    const res = await fetch(`${API_URL}/auth/resendOtp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to resend OTP");
    }
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    router.push("/login"); // Or /signin
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
