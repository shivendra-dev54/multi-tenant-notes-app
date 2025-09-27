"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/libs/AuthStore";

export default function Home() {
  const { user } = useAuthStore();
  const router = useRouter();

  const checkUserStatus = useCallback(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [router, user]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
      
      {/* Hero Section */}
      <div className="mt-32 text-center max-w-3xl">
        <h1 className="text-6xl font-extrabold mb-6">
          Organize Notes. Empower Teams.
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          A SaaS platform where organizations can manage notes, collaborate in
          secure tenants, and scale with flexible plans. Built for simplicity,
          speed, and control.
        </p>

        <div className="flex gap-6 justify-center">
          <Link
            href="/auth/sign_up"
            className="px-6 py-3 bg-indigo-600 border border-indigo-700 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/sign_in"
            className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>


      {/* Features Section */}
      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl text-center">
        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-3">Multi-Tenant</h2>
          <p className="text-gray-400">
            Create or join secure tenants. Keep personal and organizational notes
            separate but accessible.
          </p>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-3">Collaboration</h2>
          <p className="text-gray-400">
            Admins manage teams, approve requests, and control access. Users
            collaborate within their tenant.
          </p>
        </div>

        <div className="p-6 bg-gray-900 rounded-xl border border-gray-700">
          <h2 className="text-xl font-bold mb-3">Scalable Plans</h2>
          <p className="text-gray-400">
            Start free with basic features. Upgrade tenants for unlimited notes,
            advanced controls, and premium support.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-32 text-gray-600 text-sm">
        © {new Date().getFullYear()} NotesApp · Built for organizations, by developers.
      </footer>
    </div>
  );
}
