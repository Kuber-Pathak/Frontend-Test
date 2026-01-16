"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { Sparkles, Mail, Lock, User } from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/chat");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signup(fullName, email, password);
      router.push("/chat");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12">
      <div className="max-w-md w-full mx-4">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-500/20">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#ededed]">Create Account</h1>
          <p className="mt-2 text-[#a1a1aa]">
            Start your learning journey with Bato-AI
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-[#171717] rounded-2xl shadow-xl p-10 border border-[#27272a]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#ededed]">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa]"
                  size={20}
                />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#ededed] placeholder-[#52525b] focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#ededed]">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa]"
                  size={20}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#ededed] placeholder-[#52525b] focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#ededed]">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa]"
                  size={20}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#ededed] placeholder-[#52525b] focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all focus:outline-none"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
              <p className="text-xs text-[#52525b] ml-1">
                Must be at least 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-[#ededed]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#a1a1aa]"
                  size={20}
                />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-[#0a0a0a] border border-[#27272a] rounded-xl text-[#ededed] placeholder-[#52525b] focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 bg-red-600 text-white rounded-xl font-bold text-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-red-500/20 mt-4"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a1a1aa]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-red-500 hover:text-red-400 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#52525b] mt-8">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}
