"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import { useActivitiesStore } from "@/store/activitiesStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navigation from "@/components/Navigation";
import ActivityCard from "@/components/ActivityCard";
import ActivityFilter from "@/components/ActivityFilter";
import { Search } from "lucide-react";
function ActivitiesContent() {
  const { token } = useUserStore();
  const { activities, loading, fetchActivities, filters } =
    useActivitiesStore();
  useEffect(() => {
    fetchActivities(token);
  }, [token, filters]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Odkryj Małopolskę 🏔️
          </h1>
          <p className="text-gray-600 text-lg">
            {activities.length} aktywności czeka na Ciebie
          </p>
        </motion.div>

        {/* Filter */}
        <ActivityFilter />

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"
            />
          </div>
        ) : activities.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-12 text-center"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Brak aktywności
            </h3>
            <p className="text-gray-600 mb-6">
              Nie znaleziono aktywności spełniających wybrane kryteria. Spróbuj
              zmienić filtry.
            </p>
          </motion.div>
        ) : (
          /* Activities Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ActivityCard activity={activity} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
export default function ActivitiesPage() {
  return (
    <ProtectedRoute>
      <ActivitiesContent />
    </ProtectedRoute>
  );
}
