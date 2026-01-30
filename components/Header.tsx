import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Plus, Library } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from './auth/LoginButton';
import { UserMenu } from './auth/UserMenu';

export function Header() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <header className="no-print bg-indigo-600 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              RubricArchitect
            </h1>
          </Link>

          {isAuthenticated && (
            <nav className="hidden sm:flex items-center gap-4">
              <Link
                to="/builder"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/builder')
                    ? 'bg-white/20 text-white'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                New Rubric
              </Link>
              <Link
                to="/library"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/library'
                    ? 'bg-white/20 text-white'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Library className="w-4 h-4" />
                My Library
              </Link>
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated && (
            <span className="text-sm text-indigo-200 hidden sm:block">
              University Assessment Builder
            </span>
          )}
          {isAuthenticated ? <UserMenu /> : <LoginButton />}
        </div>
      </div>
    </header>
  );
}
