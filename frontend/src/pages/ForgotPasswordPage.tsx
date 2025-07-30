import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { isAxiosError, type AxiosError } from "axios";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function isApiError(err: unknown): err is AxiosError<{ error: string }> {
    return isAxiosError(err) && typeof err.response?.data?.error === "string";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await axiosInstance.post("/forgot-password", { email });
          setMessage(
      "קישור לאיפוס הסיסמה נשלח לכתובת המייל שלך. אנא בדוק/י את תיבת הדואר (כולל ספאם)."
    );

    } catch (err: unknown) {
      setError(
        isApiError(err)
          ? err.response!.data.error
          : "שגיאה בשליחת בקשת איפוס"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 px-6"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-md shadow-md p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            איפוס סיסמה
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            שלח קישור איפוס לאימייל שלך
          </p>
        </div>

        {message && (
          <p className="text-sm text-green-600 bg-green-50 py-2 text-center rounded-md">
            {message}
          </p>
        )}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 py-2 text-center rounded-md">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              אימייל
            </label>
            <input
  type="email"
  placeholder="name@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
  dir="ltr"
  className="w-full pl-4 pr-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white text-left placeholder:text-left focus:ring-2 focus:ring-blue-500"
/>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-md transition disabled:opacity-50"
          >
            {loading ? "שולח..." : "שלח קישור איפוס"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          נזכרת בסיסמה?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            התחבר
          </button>
        </p>
      </div>
    </div>
  );
}
