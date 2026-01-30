import React from 'react';
import { Navigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/auth/LoginButton';

export function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  // Redirect authenticated users to builder
  if (isAuthenticated) {
    return <Navigate to="/builder" replace />;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center relative">
      {/* Grid Pattern Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50" />

      {/* Login Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
              <Layers className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            RubricArchitect
          </h1>
          <p className="text-slate-500 text-sm">
            AI-powered assessment rubric builder
          </p>
        </div>

        <div className="space-y-4">
          <LoginButton />
          <p className="text-center text-xs text-slate-400">
            Sign in with your Google account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
