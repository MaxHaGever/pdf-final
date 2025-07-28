import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axiosInstance from "../lib/axios";
import { isAxiosError, type AxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { OfficeBuildingIcon } from "@heroicons/react/outline";

export default function ProfileSetupPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState(user?.companyName || "");
  const [companyAddress, setCompanyAddress] = useState(user?.companyAddress || "");
  const [companyPhone, setCompanyPhone] = useState(user?.companyPhone || "");
  const [companyPhone2, setCompanyPhone2] = useState(user?.companyPhone2 || "");
  const [companyEmail, setCompanyEmail] = useState(user?.companyEmail || "");
  const [companyWebsite, setCompanyWebsite] = useState(user?.companyWebsite || "");
  const [companyId, setCompanyId] = useState(user?.companyId || "");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  function isApiError(err: unknown): err is AxiosError<{ error: string }> {
    return isAxiosError(err) && typeof err.response?.data?.error === "string";
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let logoUrl = user?.companyLogo;
      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        const uploadRes = await axiosInstance.post("/uploads/logo", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        logoUrl = uploadRes.data.url;
      }

      const payload = {
        companyName,
        companyAddress,
        companyPhone,
        companyPhone2,
        companyEmail,
        companyWebsite,
        companyId,
        ...(logoUrl && { companyLogo: logoUrl }),
      };

      const profileRes = await axiosInstance.patch("/update-profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      updateUser(profileRes.data.user);
      navigate("/app");
    } catch (err: unknown) {
      setError(isApiError(err) ? err.response!.data.error : "שגיאה בעדכון הפרופיל");
      console.error("Profile update error:", err);
    }
  };

  const fields: [string, string, React.Dispatch<React.SetStateAction<string>>][] = [
    ["שם החברה", companyName, setCompanyName],
    ["כתובת החברה", companyAddress, setCompanyAddress],
    ["טלפון", companyPhone, setCompanyPhone],
    ["טלפון נוסף", companyPhone2, setCompanyPhone2],
    ["אימייל", companyEmail, setCompanyEmail],
    ["אתר אינטרנט", companyWebsite, setCompanyWebsite],
    ["ח.פ.", companyId, setCompanyId],
  ];

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 dark:bg-slate-900 px-6 py-10 flex justify-center"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-md shadow-md p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-gray-200 dark:border-slate-700">
          <OfficeBuildingIcon className="h-10 w-10 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              השלם פרופיל החברה
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">פרטי העסק שלך</p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 text-center bg-red-50 py-2 rounded-md">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {fields.map(([label, value, setter], idx) => (
            <div key={idx}>
              <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-700 text-gray-800 dark:text-white placeholder:text-right focus:ring-2 focus:ring-blue-200"
              />
            </div>
          ))}

          {/* Logo upload */}
          <div>
            <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">
              לוגו חברה (אופציונלי)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="w-full text-sm text-gray-700 dark:text-gray-300"
            />
          </div>

          {/* Primary button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-md transition"
          >
            שמור והמשך
          </button>

          {/* Inline actions */}
          <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400 mt-2">
            <button
              type="button"
              onClick={() => navigate("/update-password")}
              className="hover:underline"
            >
              עדכון סיסמה
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="hover:underline"
            >
              חזרה ליצירת מסמך
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
