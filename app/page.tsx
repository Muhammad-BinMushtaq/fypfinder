"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { loginSchema } from "@/lib/loginValidation";



type LoginFormData = z.infer<typeof loginSchema>;

export default function StudentLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/login/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log(result)

      if (!res.ok) {
        
        setServerError(result.message || "An error occurred during login.");
        return;

       }

      setSuccessMessage("✅ Login successful! Redirecting...");

    } catch (err: any) {
      setServerError(err.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          LMS Student Login
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Institutional Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="example@paf-iast.edu.pk"
              className="w-full px-4 text-gray-700 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.email && (
              <p className=" text-red-600 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="Enter your password"
              className="w-full px-4 text-gray-700 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>

          {/* Server messages */}
          {serverError && <p className="text-red-600 text-center mt-3">{serverError}</p>}
          {successMessage && <p className="text-green-600 text-center mt-3">{successMessage}</p>}
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <a href="/registration" className="text-blue-600 hover:underline">
            Get your institutional email
          </a>
        </p>
      </div>
    </main>
  );
}
