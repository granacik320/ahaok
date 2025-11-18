"use client";
import { motion } from "framer-motion";
import { useActivitiesStore } from "@/store/activitiesStore";
import { Filter, X } from "lucide-react";
import { useState } from "react";
const difficulties = [
  { value: "łatwy", label: "Łatwy" },
  { value: "średni", label: "Średni" },
  { value: "trudny", label: "Trudny" },
];
const regions = [
  { value: "Podhale", label: "Podhale" },
  { value: "Pieniny", label: "Pieniny" },
  { value: "Kraków", label: "Kraków" },
  { value: "Beskidy", label: "Beskidy" },
  { value: "Jura", label: "Jura" },
];
const activityTypes = [
  { value: "góry", label: "Góry ⛰️" },
  { value: "rower", label: "Rower 🚴" },
  { value: "spacer", label: "Spacer 🥾" },
  { value: "woda", label: "Woda 🛶" },
];
export default function ActivityFilter() {
  const { filters, setFilters, clearFilters } = useActivitiesStore();
  const [isOpen, setIsOpen] = useState(false);
  const handleFilterChange = (filterType, value) => {
    setFilters({
      [filterType]: filters[filterType] === value ? null : value,
    });
  };
  const hasActiveFilters =
    filters.difficulty || filters.region || filters.activityType;
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filtry</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <X size={16} />
              <span>Wyczyść</span>
            </motion.button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-green-600"
          >
            {isOpen ? <X size={20} /> : <Filter size={20} />}
          </button>
        </div>
      </div>

      <motion.div
        initial={{ height: 0 }}
        animate={{ height: isOpen ? "auto" : "auto" }}
        className={`space-y-4 ${isOpen ? "block" : "hidden md:block"}`}
      >
        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Poziom trudności
          </label>
          <div className="flex flex-wrap gap-2">
            {difficulties.map((diff) => (
              <motion.button
                key={diff.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange("difficulty", diff.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.difficulty === diff.value
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {diff.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Region
          </label>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <motion.button
                key={region.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange("region", region.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.region === region.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {region.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rodzaj aktywności
          </label>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => (
              <motion.button
                key={type.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFilterChange("activityType", type.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.activityType === type.value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {type.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
