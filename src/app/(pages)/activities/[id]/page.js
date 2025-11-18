'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { useProgressStore } from '@/store/progressStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import {
  MapPin,
  Clock,
  TrendingUp,
  Mountain,
  Check,
  Star,
  ArrowLeft,
  Calendar
} from 'lucide-react';

const difficultyColors = {
  'łatwy': 'bg-green-100 text-green-800 border-green-200',
  'średni': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'trudny': 'bg-red-100 text-red-800 border-red-200',
};

const activityTypeIcons = {
  'góry': '⛰️',
  'rower': '🚴',
  'spacer': '🥾',
  'woda': '🛶',
};

function ActivityDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { token } = useUserStore();
  const { updateProgress } = useProgressStore();

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchActivity();
  }, [params.id, token]);

  const fetchActivity = async () => {
    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`/api/activities/${params.id}`, config);
      setActivity(response.data);

      if (response.data.userProgress) {
        setRating(response.data.userProgress.rating || 0);
        setNotes(response.data.userProgress.notes || '');
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    const isCompleted = !activity.userProgress?.completed;
    const success = await updateProgress(
      activity.id,
      { completed: isCompleted, rating, notes },
      token
    );

    if (success) {
      fetchActivity();
    }
    setCompleting(false);
  };

  const handleRatingChange = async (newRating) => {
    setRating(newRating);
    if (activity.userProgress?.completed) {
      await updateProgress(
        activity.id,
        { completed: true, rating: newRating, notes },
        token
      );
    }
  };

  const handleNotesChange = async (newNotes) => {
    setNotes(newNotes);
    if (activity.userProgress?.completed) {
      await updateProgress(
        activity.id,
        { completed: true, rating, notes: newNotes },
        token
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Aktywność nie znaleziona
          </h1>
          <button
            onClick={() => router.push('/activities')}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Wróć do listy aktywności
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = activity.userProgress?.completed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          onClick={() => router.push('/activities')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Wróć do aktywności</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6"
        >
          {/* Image */}
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-green-400 to-blue-500">
            <div className="absolute inset-0 flex items-center justify-center text-9xl">
              {activityTypeIcons[activity.activity_type] || '🏔️'}
            </div>

            {isCompleted && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <Check size={20} />
                <span className="font-semibold">Ukończone</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${difficultyColors[activity.difficulty]}`}>
                {activity.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border-2 border-blue-200">
                {activity.region}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-800 border-2 border-purple-200">
                {activity.activity_type}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {activity.name}
            </h1>

            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {activity.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <MapPin className="text-green-600" size={24} />
                <div>
                  <p className="text-sm text-gray-600">Lokalizacja</p>
                  <p className="font-semibold text-gray-900">{activity.location}</p>
                </div>
              </div>

              {activity.duration && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="text-blue-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Czas trwania</p>
                    <p className="font-semibold text-gray-900">{activity.duration}</p>
                  </div>
                </div>
              )}

              {activity.distance && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <TrendingUp className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Dystans</p>
                    <p className="font-semibold text-gray-900">{activity.distance}</p>
                  </div>
                </div>
              )}

              {activity.elevation && (
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <Mountain className="text-red-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Przewyższenie</p>
                    <p className="font-semibold text-gray-900">{activity.elevation}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Complete Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleComplete}
              disabled={completing}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
                isCompleted
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
              }`}
            >
              {completing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check size={24} />
                  <span>{isCompleted ? 'Oznacz jako nieukończone' : 'Oznacz jako ukończone'}</span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Progress Section */}
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Twoja opinia
            </h2>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Oceń swoją przygodę
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRatingChange(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      size={32}
                      className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Notatki z wyprawy
              </label>
              <textarea
                value={notes}
                onChange={(e) => handleNotesChange(e.target.value)}
                onBlur={(e) => handleNotesChange(e.target.value)}
                placeholder="Podziel się swoimi wrażeniami..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Completed Date */}
            {activity.userProgress?.completed_at && (
              <div className="mt-6 flex items-center space-x-2 text-gray-600">
                <Calendar size={18} />
                <span className="text-sm">
                  Ukończone: {new Date(activity.userProgress.completed_at).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ActivityDetailPage() {
  return (
    <ProtectedRoute>
      <ActivityDetailContent />
    </ProtectedRoute>
  );
}
