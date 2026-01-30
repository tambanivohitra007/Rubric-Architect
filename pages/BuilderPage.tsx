import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppStep, RubricData } from '../types';
import StepWizard from '../components/StepWizard';
import Step1Outcomes from '../components/Step1Outcomes';
import Step2Criteria from '../components/Step2Criteria';
import Step3Levels from '../components/Step3Levels';
import Step4Review from '../components/Step4Review';
import { useAuth } from '../hooks/useAuth';
import { getRubricById } from '../services/firestoreService';

const defaultRubricData: RubricData = {
  topic: '',
  courseName: '',
  contextMaterial: '',
  attachedFile: null,
  rubricType: 'Analytic',
  outcomes: [],
  criteria: [],
  rows: [],
  scale: ['Emerging', 'Developing', 'Proficient', 'Mastery'],
  studentInstructions: '',
  graderInstructions: '',
  includeFeedbackSection: false,
  anchorExamples: [],
};

export function BuilderPage() {
  const { rubricId } = useParams<{ rubricId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CONTEXT);
  const [rubricData, setRubricData] = useState<RubricData>(defaultRubricData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (rubricId && user) {
      loadRubric(rubricId);
    } else if (!rubricId) {
      setRubricData(defaultRubricData);
      setCurrentStep(AppStep.CONTEXT);
    }
  }, [rubricId, user]);

  const loadRubric = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const rubric = await getRubricById(id);
      if (rubric) {
        if (rubric.userId !== user?.uid) {
          setError('You do not have permission to edit this rubric.');
          return;
        }
        setRubricData(rubric);
        setCurrentStep(AppStep.REVIEW);
      } else {
        setError('Rubric not found.');
      }
    } catch (err) {
      console.error('Error loading rubric:', err);
      setError('Failed to load rubric.');
    } finally {
      setLoading(false);
    }
  };

  const updateData = (newData: Partial<RubricData>) => {
    setRubricData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, AppStep.REVIEW));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, AppStep.CONTEXT));

  const handleSaveSuccess = (savedId: string) => {
    if (!rubricId) {
      navigate(`/builder/${savedId}`, { replace: true });
    }
    setRubricData(prev => ({ ...prev, id: savedId }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading rubric...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/builder')}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Create New Rubric
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
      <div className="no-print mb-8">
        <StepWizard currentStep={currentStep} />
      </div>

      <div className="flex-1">
        {currentStep === AppStep.CONTEXT && (
          <Step1Outcomes
            data={rubricData}
            updateData={updateData}
            onNext={nextStep}
          />
        )}

        {currentStep === AppStep.CRITERIA && (
          <Step2Criteria
            data={rubricData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === AppStep.LEVELS && (
          <Step3Levels
            data={rubricData}
            updateData={updateData}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}

        {currentStep === AppStep.REVIEW && (
          <Step4Review
            data={rubricData}
            updateData={updateData}
            onBack={prevStep}
            onSaveSuccess={handleSaveSuccess}
          />
        )}
      </div>
    </main>
  );
}
