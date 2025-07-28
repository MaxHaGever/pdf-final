import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ClipboardListIcon } from "@heroicons/react/outline";
import { useAuth } from "../hooks/useAuth";
import axios from "../lib/axios"

export default function TermsAndConditionsPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  const handleContinue = async () => {
  if (!agreed || !user) return;

  try {
    await axios.post("/accepted-terms");

    const updatedUser = { ...user, hasAcceptedTerms: true };
    updateUser(updatedUser);

    if (!updatedUser.hasChangedPassword) {
      navigate("/update-password");
    } else if (updatedUser.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  } catch (err) {
    console.error("Failed to accept terms:", err);
  }
};


  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 dark:bg-slate-900 px-6 py-10 flex justify-center"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-800 rounded-md shadow-md p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-gray-200 dark:border-slate-700">
          <ClipboardListIcon className="h-10 w-10 text-blue-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
              תנאים והגבלות
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              קרא ואשר את התנאים לפני ההמשך
            </p>
          </div>
        </div>

        {/* Terms text box */}
        <div className="h-64 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-md p-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 space-y-2 leading-relaxed">
  <p>ברוכים הבאים לשירות שלנו.</p>
  <p>
    השירות נמצא כיום בשלב הרצה (beta) לצרכי בדיקות והתנסות בלבד. ייתכנו תקלות, שינויים, אי-דיוקים או השבתות זמניות או קבועות של השירות, על פי שיקול דעתנו הבלעדי.
  </p>
  <p>
    השירות ניתן כפי שהוא ("as is") וללא כל התחייבות או אחריות מכל סוג שהוא, לרבות אך לא רק, אחריות להתאמה למטרה מסוימת, זמינות השירות, דיוק הפלטים או תקינות טכנית.
  </p>
  <p>
    מובהר כי איננו אחראים לכל נזק ישיר או עקיף, תוצאתי או מקרי, שייגרם עקב שימוש או הסתמכות על השירות או הפלטים המתקבלים ממנו.
  </p>
  <p>
    כל הזכויות בתוכן, בקוד, בלוגו ובדוחות שמורות. אין להעתיק, לשכפל, להפיץ או להשתמש בהם ללא אישור בכתב.
  </p>
  <p>
    תנאים אלו עשויים להשתנות מעת לעת. המשך השימוש בשירות מהווה הסכמה לתנאים אלו גם לאחר עדכונם.
  </p>
  <p>
    השימוש כפוף לדין הישראלי ולסמכות השיפוט הבלעדית של בתי המשפט במחוז תל אביב.
  </p>
</div>


        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="agree" className="text-sm text-gray-700 dark:text-gray-300">
            אני מאשר שקראתי ואני מסכים לתנאים והגבלות
          </label>
        </div>

        {/* Continue button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={!agreed}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-md transition disabled:opacity-50"
        >
          המשך
        </button>

        {/* Optional actions */}
        <div className="flex justify-end text-sm text-blue-600 dark:text-blue-400 mt-2">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="hover:underline"
          >
            יציאה
          </button>
        </div>
      </div>
    </div>
  );
}
