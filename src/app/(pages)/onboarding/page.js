'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import axios from 'axios';
import {
  Mountain,
  Bike,
  Footprints,
  Waves,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

const difficultyOptions = [
  { id: 'łatwy', label: 'Łatwy', description: 'Dla początkujących i rodzin', emoji: '🌱' },
  { id: 'średni', label: 'Średni', description: 'Umiarkowany wysiłek', emoji: '🌿' },
  { id: 'trudny', label: 'Trudny', description: 'Dla doświadczonych', emoji: '🏔️' }
];

const regionOptions = [
  { id: 'Podhale', label: 'Podhale', description: 'Tatry i okolice Zakopanego', emoji: '⛰️' },
  { id: 'Pieniny', label: 'Pieniny', description: 'Dunajec i Trzy Korony', emoji: '🏞️' },
  { id: 'Kraków', label: 'Kraków', description: 'Miasto i okolice', emoji: '🏰' },
  { id: 'Beskidy', label: 'Beskidy', description: 'Babia Góra i okolice', emoji: '🌲' },
  { id: 'Jura', label: 'Jura', description: 'Zamki i skały', emoji: '🏰' }
];

const activityTypeOptions = [
  { id: 'góry', label: 'Góry', description: 'Piesze wędrówki górskie', icon: Mountain, emoji: '🥾' },
  { id: 'rower', label: 'Rower', description: 'Trasy rowerowe', icon: Bike, emoji: '🚴' },
  { id: 'spacer', label: 'Spacer', description: 'Lekkie spacery', icon: Footprints, emoji: '🚶' },
  { id: 'woda', label: 'Woda', description: 'Spływy i kajaki', icon: Waves, emoji: '🚣' }
];

function QuizContent() {
  const router = useRouter();
  const { token } = useUserStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    {
      title: 'Jaki poziom trudności preferujesz?',
      subtitle: 'Możesz wybrać kilka opcji',
      emoji: '💪'
    },
    {
      title: 'Które regiony Cię interesują?',
      subtitle: 'Możesz wybrać kilka regionów',
      emoji: '🗺️'
    },
    {
      title: 'Jakie aktywności lubisz?',
      subtitle: 'Możesz wybrać kilka typów',
      emoji: '🎯'
    }
  ];

  const toggleSelection = (id, selected, setSelected) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/onboarding', {
        difficultyLevels: selectedDifficulties,
        regions: selectedRegions,
        activityTypes: selectedActivities
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setRecommendations(response.data.recommendedActivities);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return selectedDifficulties.length > 0;
      case 1: return selectedRegions.length > 0;
      case 2: return selectedActivities.length > 0;
      default: return false;
    }
  };

  const getActivityEmoji = (type) => {
    const emojis = {
      'góry': '🥾',
      'rower': '🚴',
      'spacer': '🚶',
      'woda': '🚣'
    };
    return emojis[type] || '🎯';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'łatwy': 'bg-green-100 text-green-800',
      'średni': 'bg-yellow-100 text-yellow-800',
      'trudny': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-4"
              >
                <Sparkles className="w-16 h-16 mx-auto text-yellow-500" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mamy dla Ciebie rekomendacje!
              </h1>
              <p className="text-gray-600">
                Na podstawie Twoich preferencji wybraliśmy te aktywności:
              </p>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-4 mb-8">
                {recommendations.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getActivityEmoji(activity.activity_type)}</span>
                          <h3 className="font-semibold text-gray-900">{activity.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{activity.description.substring(0, 100)}...</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(activity.difficulty)}`}>
                            {activity.difficulty}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {activity.region}
                          </span>
                          {activity.duration && (
                            <span className="text-xs text-gray-500">
                              {activity.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 mb-8">
                <p className="text-gray-600">
                  Nie znaleźliśmy aktywności pasujących do Twoich preferencji.
                  Sprawdź wszystkie dostępne aktywności!
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Link
                href="/activities"
                className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:from-green-700 hover:to-blue-700 transition-all"
              >
                <span>Zobacz aktywności</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    i <= step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < step ? <Check size={16} /> : i + 1}
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <motion.div
                className="h-full bg-gradient-to-r from-green-600 to-blue-600 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8"
            >
              <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">{steps[step].emoji}</span>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {steps[step].title}
                </h2>
                <p className="text-gray-600">{steps[step].subtitle}</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {step === 0 && difficultyOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSelection(option.id, selectedDifficulties, setSelectedDifficulties)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedDifficulties.includes(option.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                      {selectedDifficulties.includes(option.id) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </motion.button>
                ))}

                {step === 1 && regionOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSelection(option.id, selectedRegions, setSelectedRegions)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRegions.includes(option.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                      {selectedRegions.includes(option.id) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </motion.button>
                ))}

                {step === 2 && activityTypeOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleSelection(option.id, selectedActivities, setSelectedActivities)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedActivities.includes(option.id)
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </div>
                      {selectedActivities.includes(option.id) && (
                        <Check className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                step === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft size={20} />
              Wstecz
            </button>
            <motion.button
              whileHover={{ scale: canProceed() ? 1.02 : 1 }}
              whileTap={{ scale: canProceed() ? 0.98 : 1 }}
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                canProceed()
                  ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {step === 2 ? 'Zobacz rekomendacje' : 'Dalej'}
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
}
