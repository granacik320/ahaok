"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import { useProgressStore } from "@/store/progressStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import {
  ProgressBarChart,
  ProgressDoughnutChart,
} from "@/components/ProgressChart";
import { TrendingUp, Award, MapPin, Target } from "lucide-react";
import Link from "next/link";
function DashboardContent() {
  const { user, token } = useUserStore();
  const { progress, stats, fetchProgress } = useProgressStore();
  useEffect(() => {
    if (token) {
      fetchProgress(token);
    }
  }, [token]);
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const recentActivities = progress.filter((p) => p.completed).slice(0, 5);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Witaj, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Kontynuuj swoją przygodę w Małopolsce
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award className="text-green-600" size={24} />
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Ukończone
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.completed}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <MapPin className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Wszystkie aktywności
            </h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Procent ukończenia
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {completionRate}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Target className="text-yellow-600" size={24} />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Do ukończenia
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {stats.total - stats.completed}
            </p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProgressDoughnutChart stats={stats} />
          {progress.length > 0 && <ProgressBarChart progress={progress} />}
        </div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Ostatnio ukończone
            </h2>
            <Link
              href="/activities"
              className="text-green-600 hover:text-green-700 font-semibold text-sm"
            >
              Zobacz wszystkie →
            </Link>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                    {activity.activity_type === "góry" && "⛰️"}
                    {activity.activity_type === "rower" && "🚴"}
                    {activity.activity_type === "spacer" && "🥾"}
                    {activity.activity_type === "woda" && "🛶"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {activity.activity_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {activity.region} • {activity.difficulty}
                    </p>
                  </div>
                  <div className="text-green-600">
                    <Award size={24} />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 mb-4">
                Nie ukończyłeś jeszcze żadnej aktywności
              </p>
              <Link
                href="/activities"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Przeglądaj aktywności
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
