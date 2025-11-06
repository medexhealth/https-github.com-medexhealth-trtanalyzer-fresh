import React from 'react';

const SymptomsList = [
  'Anxiety', 'Sleep disturbance', 'Heart palpitations', 'High blood pressure',
  'Chest pain', 'Low libido', 'Erectile dysfunction', 'Fatigue',
  'Mood swings', 'Acne', 'Water retention', 'None of the above'
];

export const SymptomsSelector = ({ selectedSymptoms, onChange }: { selectedSymptoms: string[], onChange: (symptoms: string[]) => void }) => {
    const handleSymptomToggle = (symptom: string) => {
        let newSelection: string[];
        if (symptom === 'None of the above') {
            newSelection = selectedSymptoms.includes(symptom) ? [] : ['None of the above'];
        } else {
            if (selectedSymptoms.includes(symptom)) {
                newSelection = selectedSymptoms.filter((s) => s !== symptom);
            } else {
                newSelection = [...selectedSymptoms.filter(s => s !== 'None of the above'), symptom];
            }
        }
        onChange(newSelection);
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SymptomsList.map(symptom => (
                <button
                    key={symptom}
                    type="button"
                    onClick={() => handleSymptomToggle(symptom)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 ${selectedSymptoms.includes(symptom) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                    {symptom}
                </button>
            ))}
        </div>
    );
};
