import React, { useState } from 'react';
import { AppStep, RubricData } from './types';
import StepWizard from './components/StepWizard';
import Step1Outcomes from './components/Step1Outcomes';
import Step2Criteria from './components/Step2Criteria';
import Step3Levels from './components/Step3Levels';
import Step4Review from './components/Step4Review';
import { Layers } from 'lucide-react';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.CONTEXT);
  
  const [rubricData, setRubricData] = useState<RubricData>({
    topic: '',
    courseName: '',
    contextMaterial: '',
    attachedFile: null,
    outcomes: [],
    criteria: [],
    rows: [],
    scale: ['Emerging', 'Developing', 'Proficient', 'Mastery'],
  });

  const updateData = (newData: Partial<RubricData>) => {
    setRubricData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, AppStep.REVIEW));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, AppStep.CONTEXT));

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      
      {/* Header */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-indigo-500 bg-clip-text text-transparent">
              RubricArchitect
            </h1>
          </div>
          <div className="text-sm text-slate-500 hidden sm:block">
            University Assessment Builder
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        
        {/* Progress Bar (Hidden on Final Step during print) */}
        <div className="no-print mb-8">
           <StepWizard currentStep={currentStep} />
        </div>

        {/* Dynamic Step Content */}
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
              onBack={prevStep} 
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-center text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} RubricArchitect. Built with Google Gemini.
        </div>
      </footer>

    </div>
  );
};

export default App;
