"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; auth?: string }>({});
  const [successMessage, setSuccessMessage] = useState("");

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    authService.login({ email, password })
      .then((data) => {
        setIsLoading(false);
        localStorage.setItem("tea-estate-token", data.token);
        localStorage.setItem("tea-estate-user", JSON.stringify(data.user));
        
        setSuccessMessage("Sign in successful! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      })
      .catch((err) => {
        setIsLoading(false);
        const errMsg = err.response?.data?.message || err.message || "Invalid email or password.";
        setErrors({
          auth: errMsg
        });
      });
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full select-none"
      style={{
        backgroundImage: `linear-gradient(180.05deg, rgba(255, 255, 255, 0) 0.04%, rgba(3, 67, 20, 0.9) 99.96%), url('/login-bg.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Container Card */}
      <div className="w-full max-w-[448px] min-h-[496px] bg-white rounded-2xl shadow-2xl p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-emerald-950/20 mx-4">

        {/* Header Block */}
        <div className="flex flex-col items-center w-full">
          {/* Logo container */}
          <div className="w-16 h-16 bg-gradient-to-br from-[#00A63E] to-[#009966] rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-105">
            {/* Custom SVG Leaf Icon */}
            <Image src="/leaf.png" alt="Logo" width={34} height={34} />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#101828] mt-4 tracking-tight text-center leading-8">
            Tea Estate Managment
          </h1>

          {/* Subtitle */}
          <p className="text-base font-normal text-[#4A5565] mt-1 text-center leading-6">
            Sign in to your account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col w-full mt-6 flex-1 justify-between">

          {/* Input Fields */}
          <div className="flex flex-col gap-5">
            {/* Auth/Validation Errors */}
            {errors.auth && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 text-center animate-pulse">
                {errors.auth}
              </div>
            )}
            {successMessage && (
              <div className="text-sm font-medium text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
                {successMessage}
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col w-full">
              <label className="text-sm font-medium text-[#364153] mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full h-[50px] border rounded-[10px] px-4 py-3 text-base text-[#101828] placeholder-black/50 outline-none transition-all duration-200 ${errors.email
                  ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                  : "border-[#D1D5DC] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100"
                  }`}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="text-xs text-red-600 mt-1 font-medium pl-1">
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col w-full relative">
              <label className="text-sm font-medium text-[#364153] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full h-[50px] border rounded-[10px] pl-4 pr-12 py-3 text-base text-[#101828] placeholder-black/50 outline-none transition-all duration-200 ${errors.password
                    ? "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200"
                    : "border-[#D1D5DC] focus:border-[#00A63E] focus:ring-2 focus:ring-emerald-100"
                    }`}
                  disabled={isLoading}
                />

                {/* Eye Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4A5565] hover:text-[#101828] transition-colors cursor-pointer select-none focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="text-xs text-red-600 mt-1 font-medium pl-1">
                  {errors.password}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-gradient-to-r from-[#00A63E] to-[#009966] text-white font-medium text-base rounded-[10px] mt-8 flex items-center justify-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] hover:opacity-95 hover:shadow-lg active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
