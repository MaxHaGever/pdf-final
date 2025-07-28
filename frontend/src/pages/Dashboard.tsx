import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import {
  UserCircleIcon,
  DocumentTextIcon,
  PhotographIcon,
  TrashIcon,
  CogIcon,
  LogoutIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/outline';

const VITE_API_URL = import.meta.env.VITE_API_URL;

interface UploadedImageResponse {
  url: string;
  description: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<{
    file: File;
    preview: string;
    description: string;
  }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const MAX_IMAGES = 5;

  const keywordGroups = {
    'פרטי הדוח': ['סוג הנכס', 'כתובת הבדיקה', 'שם הלקוח', 'תאריך'],
    'פרטי הבודק': ['שם הבודק', 'טלפון ליצירת קשר', 'השכלת הבודק', 'נסיון הבודק'],
    'שיטות וכלים ששומשו בבדיקה': ['מצלמה', 'בדיקה'],
    'מוקדי נזילה': ['מוקד הנזילה', 'תיאור הנזילה'],
    'המלצות': ['המלצות', 'הערות'],
  };

  console.log("Current user in AdminDashboard:", user);


  const foundKeywords = useMemo(() => {
    const found = new Set<string>();
    Object.values(keywordGroups).flat().forEach((kw) => {
      if (prompt.includes(kw)) found.add(kw);
    });
    return found;
  }, [prompt]);

  const logoSrc = user?.companyLogo
    ? user.companyLogo.startsWith('http')
      ? user.companyLogo
      : `${VITE_API_URL}${user.companyLogo}`
    : null;

  const handleProfile = () => navigate('/setup-profile');
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_IMAGES - images.length);
    const newItems = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      description: '',
    }));
    setImages((prev) => [...prev, ...newItems]);
  };

  const handleDescChange = (index: number, desc: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, description: desc } : img))
    );
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPdfUrl(null);
    try {
      let uploadedImages: UploadedImageResponse[] = [];
      if (images.length) {
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img.file));
        formData.append('descriptions', JSON.stringify(images.map((img) => img.description)));
        const res = await axios.post('/uploads/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploadedImages = res.data.images;
      }

      const pdfRes = await axios.post(
        '/ai/leak-detection',
        { prompt, images: uploadedImages },
        { responseType: 'blob' }
      );
      const blob = new Blob([pdfRes.data], { type: 'application/pdf' });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert('שגיאה ביצירת הדו״ח');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 px-6 py-10 flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-lg shadow p-6 space-y-6"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt="Logo"
                className="h-10 w-10 rounded-full border object-cover"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
            )}
            <div>
              <h1 className="text-xl font-medium">שלום, {user?.companyName || 'משתמש'}!</h1>
              <p className="text-sm text-gray-500">צור דוח איתור נזילות</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={handleProfile} className="p-2">
              <CogIcon className="h-5 w-5" />
            </button>
            <button type="button" onClick={handleLogout} className="p-2">
              <LogoutIcon className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </header>

        {/* Prompt Input + Keyword Tracker */}
        <section>
          <p className="text-sm text-gray-600 mb-2">
  הקלד תיאור חופשי של הבדיקה. מילים מודגשות יסמנו שהמערכת הבינה את הפרטים – כל המילים הן אופציונליות, אבל עוזרות לדוח להיות מדויק ומלא יותר. 
  <br />
  אין צורך להזין את פרטי החברה – הם ייכללו אוטומטית בדוח לפי ההגדרות שלך.
</p>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="הקלד כאן..."
              rows={4}
              className="w-full border rounded-md p-3 pr-10 text-sm"
            />
            <DocumentTextIcon className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
          </div>

          <div className="mt-4 space-y-4">
            {Object.entries(keywordGroups).map(([group, keywords]) => {
              const groupComplete = keywords.every((kw) => foundKeywords.has(kw));
              return (
                <div
                  key={group}
                  className={`rounded-md p-4 border ${
                    groupComplete ? 'border-green-500 bg-green-50' : 'border-yellow-400 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold">
                      {group}
                      {group === 'מוקדי נזילה' && (
                        <span className="block text-xs text-gray-500 mt-1">
                          ניתן להזין יותר ממוקד נזילה אחד, לפי הצורך
                        </span>
                      )}
                    </h3>
                    {groupComplete ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    ) : (
                      <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {keywords.map((kw) => (
                      <span
                        key={kw}
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${
                          foundKeywords.has(kw)
                            ? 'bg-green-100 text-green-800 border-green-400'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Image Upload */}
        <section>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-300 rounded-md px-4 py-2 mb-3">
            <ExclamationCircleIcon className="h-5 w-5 text-blue-500" />
            <p className="text-sm text-blue-700 font-medium">
              העלה את התמונות לפי סדר תיאור מוקדי הנזילה (מוקד ראשון, שני וכו')
            </p>
          </div>

          <label className="block text-sm font-medium mb-1">
            תמונות ({images.length}/{MAX_IMAGES})
          </label>
          <div className="border-dashed border-2 border-gray-300 p-4 rounded-md text-center cursor-pointer relative">
            <PhotographIcon className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500">גרור או לחץ לבחירת תמונות</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddImages}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={images.length >= MAX_IMAGES}
            />
          </div>
          <div className="mt-4 space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={img.preview}
                  alt="preview"
                  className="w-16 h-16 object-cover rounded"
                />
                <input
                  type="text"
                  value={img.description}
                  onChange={(e) => handleDescChange(idx, e.target.value)}
                  placeholder={`תיאור תמונה ${idx + 1}`}
                  className="flex-1 border rounded-md p-2 text-sm"
                />
                <button type="button" onClick={() => handleRemove(idx)}>
                  <TrashIcon className="h-5 w-5 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <section className="space-y-3">
  <button
    type="submit"
    disabled={loading || !prompt.trim()}
    className="w-full bg-blue-600 text-white py-3 rounded-md disabled:opacity-50 flex justify-center items-center gap-2"
  >
    {loading ? (
      <>
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
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      </>
    ) : (
      'צור דוח'
    )}
  </button>

  {pdfUrl && (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-center text-blue-600 underline"
    >
      הורד את הדוח
    </a>
  )}
</section>

      </form>
    </div>
  );
}
