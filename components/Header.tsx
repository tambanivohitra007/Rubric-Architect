import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, Plus, Library, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserMenu } from './auth/UserMenu';

export function Header() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="no-print bg-slate-900 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-teal-500 p-1.5 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              RubricArchitect
            </h1>
          </Link>

          {isAuthenticated && (
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                to="/builder"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/builder')
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                New Rubric
              </Link>
              <Link
                to="/library"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/library'
                    ? 'bg-white/10 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
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
            <span className="text-sm text-slate-400 hidden sm:block">
              University Assessment Builder
            </span>
          )}
          {isAuthenticated && (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
              <div className="hidden sm:block">
                <UserMenu />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="sm:hidden bg-slate-800 border-t border-slate-700">
          <nav className="px-4 py-3 space-y-1">
            <Link
              to="/builder"
              onClick={closeMobileMenu}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith('/builder')
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              New Rubric
            </Link>
            <Link
              to="/library"
              onClick={closeMobileMenu}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/library'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Library className="w-4 h-4" />
              My Library
            </Link>
            <div className="pt-2 border-t border-slate-700">
              <UserMenu />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
