"use client";
import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
export function ProgressBarChart({ progress }) {
  // Grupowanie po regionach
  const regionData = progress.reduce((acc, item) => {
    if (item.completed) {
      acc[item.region] = (acc[item.region] || 0) + 1;
    }
    return acc;
  }, {});
  const data = {
    labels: Object.keys(regionData),
    datasets: [
      {
        label: "Ukończone aktywności",
        data: Object.values(regionData),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(59, 130, 246)",
          "rgb(168, 85, 247)",
          "rgb(251, 191, 36)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Ukończone aktywności według regionów",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </motion.div>
  );
}
export function ProgressDoughnutChart({ stats }) {
  const data = {
    labels: ["Ukończone", "Do ukończenia"],
    datasets: [
      {
        data: [stats.completed, stats.total - stats.completed],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(229, 231, 235, 0.8)"],
        borderColor: ["rgb(34, 197, 94)", "rgb(229, 231, 235)"],
        borderWidth: 2,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Postęp ogólny",
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </motion.div>
  );
}
