import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axios';
import { isAxiosError } from 'axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('הקישור איפוס הסיסמה אינו תקין או חסר');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('הסיסמאות לא תואמות');
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post('/reset-password', {
        token,
        password,
      });
      setMessage('הסיסמא עודכנה, מועבר להתחברות');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: unknown) {
      let errMsg = 'שגיאה באיפוס הסיסמה';
      if (isAxiosError(err) && err.response?.data?.error) {
        const srv = err.response.data.error;
        if (srv === 'Token and password are required') {
          errMsg = 'יש לצרף טוקן וסיסמה';
        } else if (srv === 'Invalid or expired reset token') {
          errMsg = 'הקישור פג תוקף או אינו תקין';
        } else if (srv === 'User not found') {
          errMsg = 'המשתמש לא נמצא';
        } else if (srv === 'Password too short') {
          errMsg = 'הסיסמה קצרה מדי (לפחות 8 תווים)';
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (error && !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md bg-white rounded-md shadow-md p-8 space-y-6">
        <h1 className="text-xl font-semibold text-gray-800">איפוס סיסמה</h1>

        {message ? (
          <p className="text-green-600 bg-green-50 p-2 text-center rounded-md">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <p className="text-red-600 bg-red-50 p-2 text-center rounded-md">{error}</p>
            )}
            <div>
              <label className="block mb-1 text-sm">סיסמה חדשה</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">אישור סיסמה</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition disabled:opacity-50"
            >
              {loading ? 'שולח…' : 'אפס סיסמה'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
