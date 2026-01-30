import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { BuilderPage } from './pages/BuilderPage';
import { LibraryPage } from './pages/LibraryPage';
import { SharedRubricPage } from './pages/SharedRubricPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public shared rubric route - no header, self-contained layout */}
        <Route path="/shared/:shareId" element={<SharedRubricPage />} />

        {/* Routes with main layout */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
              <Header />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/builder"
                  element={
                    <ProtectedRoute>
                      <BuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/builder/:rubricId"
                  element={
                    <ProtectedRoute>
                      <BuilderPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <LibraryPage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <footer className="no-print border-t border-slate-200 bg-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-6 flex justify-center text-slate-400 text-sm">
                  &copy; {new Date().getFullYear()} RubricArchitect. Powered by <a href='https://rindra.org'><strong>Rindra Razafinjatovo</strong></a> .
                </div>
              </footer>
            </div>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
