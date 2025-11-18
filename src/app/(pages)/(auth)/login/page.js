
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';
import { Mail, Lock, ArrowRight } from 'lucide-react';
export default function LoginPage() {
const router = useRouter();
const { setUser } = useUserStore();
const [formData, setFormData] = useState({
email: '',
password: '',
});
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
const handleChange = (e) => {
setFormData({
...formData,
[e.target.name]: e.target.value,
});
};
const handleSubmit = async (e) => {
e.preventDefault();
setError('');
setLoading(true);
try {
  const response = await axios.post('/api/auth/login', formData);
  setUser(response.data.user, response.data.token);

  // Przekieruj do quizu jeśli nie ukończony onboarding
  if (!response.data.onboardingCompleted) {
    router.push('/onboarding');
  } else {
    router.push('/dashboard');
  }
} catch (err) {
  setError(err.response?.data?.error || 'Błąd podczas logowania');
} finally {
  setLoading(false);
}
};
return (
<div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5 }}
className="max-w-md w-full"
>
<div className="bg-white rounded-2xl shadow-2xl p-8">
{/* Header */}
<div className="text-center mb-8">
<motion.div
initial={{ scale: 0 }}
animate={{ scale: 1 }}
transition={{ delay: 0.2, type: 'spring' }}
className="text-6xl mb-4"
>
🏔️
</motion.div>
<h1 className="text-3xl font-bold text-gray-900 mb-2">
Witaj z powrotem!
</h1>
<p className="text-gray-600">
Zaloguj się, aby kontynuować swoją przygodę
</p>
</div>
      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="twoj@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hasło
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Zaloguj się</span>
              <ArrowRight size={20} />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Nie masz konta?{' '}
          <Link href="/register" className="text-green-600 hover:text-green-700 font-semibold">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  </motion.div>
</div>
);
}
