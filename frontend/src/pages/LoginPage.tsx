import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  MailIcon,
  EyeIcon,
  EyeOffIcon,
  UserCircleIcon,
} from "@heroicons/react/outline";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  try {
    const user = await login(email, password); 

    if (!user.hasChangedPassword) {
      navigate("/update-password");
    } else if (!user.hasAcceptedTerms) {
      navigate("/terms");
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    console.error("Login error:", err);
    setError("אימייל או סיסמה שגויים");
  }
};


  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 px-6"
    >
      <div className="bg-white dark:bg-slate-800 w-full max-w-md shadow-md rounded-md p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <UserCircleIcon className="h-10 w-10 text-blue-600 dark:text-white" />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            התחברות למערכת
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            אנא הזן את פרטי הכניסה שלך
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              אימייל
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full pr-10 pl-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 placeholder:text-right"
              />
              <MailIcon className="absolute top-2.5 right-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              סיסמה
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pr-10 pl-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 placeholder:text-right"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 right-3"
                aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-md">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-md transition"
          >
            התחבר
          </button>
        </form>

        {/* Footer Links */}
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
          <Link
            to="/forgot-password"
            className="hover:underline text-blue-600 dark:text-blue-400"
          >
            שכחת סיסמה?
          </Link>
          <span>
            אין לך חשבון?{" "}
            <Link
              to="/register"
              className="hover:underline text-blue-600 dark:text-blue-400"
            >
              הירשם כאן
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
