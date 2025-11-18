'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, Clock, TrendingUp, Check } from 'lucide-react';
import Image from 'next/image';

const difficultyColors = {
  'łatwy': 'bg-green-100 text-green-800',
  'średni': 'bg-yellow-100 text-yellow-800',
  'trudny': 'bg-red-100 text-red-800',
};

const activityTypeIcons = {
  'góry': '⛰️',
  'rower': '🚴',
  'spacer': '🥾',
  'woda': '🛶',
};

export default function ActivityCard({ activity, showCompleted = true }) {
  return (
    <Link href={`/activities/${activity.id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
      >
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            {activityTypeIcons[activity.activity_type] || '🏔️'}
          </div>
          {showCompleted && activity.completed && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-2 rounded-full shadow-lg">
              <Check size={20} />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
              {activity.name}
            </h3>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {activity.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[activity.difficulty]}`}>
              {activity.difficulty}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 font-medium">
              {activity.region}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <MapPin size={14} className="text-gray-400" />
              <span>{activity.location}</span>
            </div>
            {activity.duration && (
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-gray-400" />
                <span>{activity.duration}</span>
              </div>
            )}
            {activity.distance && (
              <div className="flex items-center space-x-2">
                <TrendingUp size={14} className="text-gray-400" />
                <span>{activity.distance}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
