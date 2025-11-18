"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { motion } from "framer-motion";
export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useUserStore();

  useEffect(() => {
    // Wait for hydration before checking authentication
    if (_hasHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Show loading while hydrating or if not authenticated
  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }
  return <>{children}</>;
}
