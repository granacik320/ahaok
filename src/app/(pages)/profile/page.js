'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { User, Mail, Settings, Save } from 'lucide-react';

const difficulties = ['łatwy', 'średni', 'trudny'];
const regions = ['Podhale', 'Pieniny', 'Kraków', 'Beskidy', 'Jura'];
const activityTypes = [
  { value: 'góry', label: 'Góry ⛰️' },
  { value: 'rower', label: 'Rower 🚴' },
  { value: 'spacer', label: 'Spacer 🥾' },
  { value: 'woda', label: 'Woda 🛶' },
];

function ProfileContent() {
  const { user, token, updateUser } = useUserStore();
  const { preferences, setPreferences } = usePreferencesStore();

  const [name, setName] = useState(user?.name || '');
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedActivityTypes, setSelectedActivityTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get('/api/user', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setName(response.data.name);

      if (response.data.preferences) {
        setSelectedDifficulties(response.data.preferences.difficultyLevels || []);
        setSelectedRegions(response.data.preferences.regions || []);
        setSelectedActivityTypes(response.data.preferences.activityTypes || []);
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleToggle = (array, setArray, value) => {
    if (array.includes(value)) {
      setArray(array.filter(item => item !== value));
    } else {
      setArray([...array, value]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const newPreferences = {
        difficultyLevels: selectedDifficulties,
        regions: selectedRegions,
        activityTypes: selectedActivityTypes,
      };

      await axios.put(
        '/api/user',
        { name, preferences: newPreferences },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      updateUser({ name });
      setPreferences(newPreferences);
      setMessage('Profil został zaktualizowany! ✅');

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Błąd podczas aktualizacji profilu ❌');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Twój profil
          </h1>
          <p className="text-gray-600 text-lg">
            Zarządzaj swoimi danymi i preferencjami
          </p>
        </motion.div>

        {/* Success/Error Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg ${
              message.includes('✅')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Settings className="text-green-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-900">
              Informacje podstawowe
            </h2>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię i nazwisko
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Email nie może być zmieniony
              </p>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Preferencje aktywności
          </h2>

          {/* Difficulty */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferowany poziom trudności
            </label>
            <div className="flex flex-wrap gap-3">
              {difficulties.map((difficulty) => (
                <motion.button
                  key={difficulty}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(selectedDifficulties, setSelectedDifficulties, difficulty)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedDifficulties.includes(difficulty)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {difficulty}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Regions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferowane regiony
            </label>
            <div className="flex flex-wrap gap-3">
              {regions.map((region) => (
                <motion.button
                  key={region}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(selectedRegions, setSelectedRegions, region)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedRegions.includes(region)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {region}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Activity Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferowane rodzaje aktywności
            </label>
            <div className="flex flex-wrap gap-3">
              {activityTypes.map((type) => (
                <motion.button
                  key={type.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle(selectedActivityTypes, setSelectedActivityTypes, type.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedActivityTypes.includes(type.value)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={20} />
              <span>Zapisz zmiany</span>
            </>
          )}
        </motion.button>

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
