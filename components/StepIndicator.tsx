import React from 'react';

export const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => {
            const step = i + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            return (
                <React.Fragment key={step}>
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-lg' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                            {isCompleted ? '✓' : step}
                        </div>
                    </div>
                    {step < totalSteps && <div className={`h-1 flex-1 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />}
                </React.Fragment>
            );
        })}
    </div>
);
