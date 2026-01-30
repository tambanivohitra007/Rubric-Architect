import React from 'react';
import { Navigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AuthForm } from '../components/auth/AuthForm';

export function HomePage() {
  const { isAuthenticated, loading } = useAuth();

  // Redirect authenticated users to builder
  if (isAuthenticated) {
    return <Navigate to="/builder" replace />;
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center relative py-8 bg-slate-50">
      {/* Subtle pattern background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-100 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-amber-100 rounded-full blur-3xl opacity-40" />

      {/* Login Card */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-900 p-3 rounded-xl shadow-lg">
              <Layers className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            RubricArchitect
          </h1>
          <p className="text-slate-500 text-sm">
            AI-powered assessment rubric builder
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
