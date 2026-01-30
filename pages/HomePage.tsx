import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Sparkles, Share2, Cloud, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoginButton } from '../components/auth/LoginButton';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Generate comprehensive rubrics with Google Gemini AI based on your learning outcomes.',
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Save your rubrics to the cloud and access them from anywhere.',
    },
    {
      icon: Share2,
      title: 'Easy Sharing',
      description: 'Share rubrics with colleagues via public links.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Layers className="w-12 h-12" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Build Assessment Rubrics with AI
            </h1>
            <p className="text-lg sm:text-xl text-indigo-100 mb-10">
              Create professional, comprehensive rubrics in minutes. Powered by Google Gemini AI to help educators save time and improve assessment quality.
            </p>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/builder')}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-lg"
              >
                Create New Rubric
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <LoginButton />
                <p className="text-indigo-200 text-sm">
                  Sign in to start creating rubrics
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Everything you need to create great rubrics
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-slate-200"
              >
                <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Ready to streamline your assessment process?
            </h2>
            <p className="text-slate-600 mb-8">
              Join educators who use RubricArchitect to create better assessments in less time.
            </p>
            <LoginButton />
          </div>
        </section>
      )}
    </div>
  );
}
