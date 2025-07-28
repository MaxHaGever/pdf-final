import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { isAxiosError, type AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";

export default function UpdatePasswordPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  if (!token || !user) return <Navigate to="/login" replace />;

  function isApiError(err: unknown): err is AxiosError<{ error: string }> {
    return isAxiosError(err) && typeof err.response?.data?.error === "string";
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setSuccess(null);

  if (newPassword !== confirmPassword) {
    setError("הסיסמאות החדשות לא תואמות");
    return;
  }

  setLoading(true);
  try {
    await axiosInstance.patch(
      "/update-password",
      { oldPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    await axiosInstance.post("/changed-password", {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const updatedUser = { ...user!, hasChangedPassword: true };
    updateUser(updatedUser);

    setSuccess("הסיסמה עודכנה בהצלחה!");

    setTimeout(() => {
      if (!updatedUser.hasAcceptedTerms) {
        navigate("/terms");
      } else {
        navigate("/dashboard");
      }
    }, 1000);
  } catch (err: unknown) {
    setError(
      isApiError(err) ? err.response!.data.error : "שגיאה בעדכון הסיסמה"
    );
    console.error("Update password error:", err);
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
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            עדכון סיסמה
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            הזן את הסיסמה הישנה והחדשה שלך
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 py-2 text-center rounded-md">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 py-2 text-center rounded-md">
            {success}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              סיסמה נוכחית
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder:text-right focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              סיסמה חדשה
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder:text-right focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              אשר סיסמה חדשה
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder:text-right focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-md transition disabled:opacity-50"
          >
            {loading ? "שומר..." : "עדכן סיסמה"}
          </button>

          <div className="text-sm text-center text-blue-600 dark:text-blue-400 mt-2">
            <button
              type="button"
              onClick={() => navigate("/setup-profile")}
              className="hover:underline"
            >
              חזור לפרופיל
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
