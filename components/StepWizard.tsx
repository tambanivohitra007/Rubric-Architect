import React from 'react';
import { AppStep } from '../types';
import { Check } from 'lucide-react';

interface Props {
  currentStep: AppStep;
}

const steps = [
  { id: AppStep.CONTEXT, label: 'Context' },
  { id: AppStep.CRITERIA, label: 'Criteria' },
  { id: AppStep.LEVELS, label: 'Levels' },
  { id: AppStep.REVIEW, label: 'Review' },
];

const StepWizard: React.FC<Props> = ({ currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="relative flex justify-between items-center max-w-2xl mx-auto">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10 transform -translate-y-1/2"></div>
        <div 
            className="absolute top-1/2 left-0 h-0.5 bg-teal-600 -z-10 transform -translate-y-1/2 transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center bg-transparent gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 z-10
                  ${isCompleted ? 'bg-teal-600 border-teal-600 text-white' : ''}
                  ${isCurrent ? 'bg-white border-teal-600 text-teal-600 scale-110 shadow-lg' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-slate-50 border-slate-300 text-slate-400' : ''}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`text-xs font-medium transition-colors ${isCurrent ? 'text-teal-700' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepWizard;
