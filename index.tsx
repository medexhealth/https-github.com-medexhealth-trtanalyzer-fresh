import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- TYPES ---
const InjectionFrequency = {
  ONCE_A_WEEK: 'Once a week',
  TWICE_A_WEEK: 'Twice a week',
  THREE_TIMES_A_WEEK: 'Three times a week or more',
  OTHER: 'Other',
} as const;

const BloodTestTiming = {
  PEAK: 'Peak (1-2 days after injection)',
  MID: 'Mid-cycle (3-5 days after injection)',
  TROUGH: 'Trough (day of next injection, before injecting)',
  UNSURE: 'Unsure',
} as const;

interface LabValues {
  totalTestosterone: string;
  freeTestosterone: string;
  estradiol: string;
  hematocrit: string;
}

interface FormData {
  injectionFrequency: string;
  bloodTestTiming: string;
  labs: LabValues;
  symptoms: string[];
}

// --- ANALYTICS ---
const trackEvent = (eventName: string, properties: object = {}) => {
  console.log(`[Analytics] Event: ${eventName}`, properties);
  // In a real-world scenario, this would send data to an analytics service like Google Analytics, PostHog, etc.
};


// --- SECURE ANALYSIS SERVICE ---
const analyzeLabResults = async (formData: FormData): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formData }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); // Gracefully handle non-JSON responses
      console.error("Backend function error:", errorData);
      
      if (errorData.error) {
        const lowerError = errorData.error.toLowerCase();
        if (lowerError.includes('api key')) {
          return "Error: The server reported a problem with the API key. Please double-check that the GEMINI_API_KEY is correctly set in your Netlify site settings. Ensure there are no extra spaces or characters copied by mistake.";
        }
        if (lowerError.includes('safety settings')) {
          return "Error: The analysis was blocked by the AI's safety filter. This can happen with medical data. Please adjust your inputs and retry.";
        }
      }
      
      return `Error: The analysis service is temporarily unavailable (Status: ${response.status}). Please try again.`;
    }

    const data = await response.json();
    if (data.error) {
      return `Error: ${data.error}`;
    }
    
    return data.result;

  } catch (error) {
    console.error("Error calling backend function:", error);
    return "An error occurred while connecting to the analysis service. Please check your internet connection and try again.";
  }
};

// --- ICON COMPONENTS ---
const ChevronLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);
const ChevronRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 3.75h15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
    </svg>
);
const ShieldCheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />
    </svg>
);
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const ClipboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);

// --- UI COMPONENTS (Re-integrated) ---

const Markdown = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    let html = '';
    let inList = false;

    const processInline = (text: string) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    for (const line of lines) {
        if (line.trim().startsWith('### ')) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<h3 class="text-xl font-bold text-cyan-400 mt-6 mb-3">${processInline(line.trim().substring(4))}</h3>`;
        } else if (line.trim().startsWith('- ')) {
            if (!inList) { html += '<ul class="space-y-2 mt-2 list-outside">'; inList = true; }
            html += `<li class="ml-5 list-disc">${processInline(line.trim().substring(2))}</li>`;
        } else if (line.trim().length > 0) {
            if (inList) { html += '</ul>'; inList = false; }
            html += `<p>${processInline(line.trim())}</p>`;
        }
    }

    if (inList) { html += '</ul>'; }

    return <div className="space-y-2" dangerouslySetInnerHTML={{ __html: html }} />;
};

const ResultDisplay = ({ result }: { result: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const guideTitle = "### Your Personalized Doctor Discussion Guide";
        const oldGuideTitle = "### Protocol Considerations & Discussion Points for the Doctor";
        const disclaimerTitle = "### Important Disclaimer";

        let startIndex = result.indexOf(guideTitle);
        if (startIndex === -1) {
            startIndex = result.indexOf(oldGuideTitle);
        }
        
        if (startIndex === -1) {
            console.error("Could not find the discussion guide section to copy.");
            // As a fallback, copy the entire text if the guide isn't found
            navigator.clipboard.writeText(result);
            return;
        }

        const disclaimerIndex = result.indexOf(disclaimerTitle, startIndex);
        
        let textToCopy = disclaimerIndex !== -1 
            ? result.substring(startIndex, disclaimerIndex)
            : result.substring(startIndex);

        // Clean up markdown for plain text
        textToCopy = textToCopy
            .replace(/###.*?\n/g, '') // Remove headings
            .replace(/\*\*/g, '')      // Remove bold markers
            .replace(/- /g, '\n- ')     // Add newline before list items
            .trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    if (!result) return null;
    return (
        <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-lg shadow-2xl animate-fade-in border border-cyan-500/20">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">Analysis Report</h2>
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-800/70 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 rounded-lg transition-all duration-200 disabled:opacity-50"
                    disabled={copied}
                >
                    {copied ? <> <CheckIcon className="w-4 h-4 text-green-400" /> Copied!</> : <> <ClipboardIcon className="w-4 h-4" /> Copy Discussion Guide</>}
                </button>
            </div>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                <Markdown content={result} />
            </div>
        </div>
    );
};

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => (
    <div className="flex justify-center items-center space-x-2 sm:space-x-4 mb-8">
        {Array.from({ length: totalSteps }, (_, i) => {
            const step = i + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            return (
                <React.Fragment key={step}>
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 border ${isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 animate-glow' : isCompleted ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-gray-800/50 text-gray-400 border-gray-700'}`}>
                            {isCompleted ? '✓' : step}
                        </div>
                    </div>
                    {step < totalSteps && <div className={`h-1 flex-1 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}`} />}
                </React.Fragment>
            );
        })}
    </div>
);

const SymptomsList = [
  'Anxiety', 'Sleep disturbance', 'Heart palpitations', 'High blood pressure',
  'Chest pain', 'Low libido', 'Erectile dysfunction', 'Fatigue',
  'Mood swings', 'Acne', 'Water retention', 'None of the above'
];

const SymptomsSelector = ({ selectedSymptoms, onChange }: { selectedSymptoms: string[], onChange: (symptoms: string[]) => void }) => {
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
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${selectedSymptoms.includes(symptom) ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500' : 'bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/70 hover:border-gray-600'}`}
                >
                    {symptom}
                </button>
            ))}
        </div>
    );
};


// --- MAIN APP COMPONENT ---
const App = () => {
    type AppState = 'INTRO' | 'FORM' | 'AWAITING_PAYMENT' | 'VERIFYING_PAYMENT' | 'ANALYZING' | 'RESULT';
    const [appState, setAppState] = useState<AppState>('INTRO');
    const [currentStep, setCurrentStep] = useState(1);
    const [analysisSession, setAnalysisSession] = useState<any>(null);
    const [confirmationUrl, setConfirmationUrl] = useState('');
    
    const [formData, setFormData] = useState<FormData>({
        injectionFrequency: '',
        bloodTestTiming: '',
        labs: { totalTestosterone: '', freeTestosterone: '', estradiol: '', hematocrit: '' },
        symptoms: [],
    });
    const [analysisResult, setAnalysisResult] = useState('');
    const [error, setError] = useState('');

    const analyzingMessages = [
      'Correlating hematocrit with your injection frequency...',
      'Analyzing estradiol levels against reported symptoms...',
      'Consulting clinical patterns from Dr. T\'s training data...',
      'Cross-referencing biomarkers with your current protocol...',
      'Formatting your Personalized Doctor Discussion Guide...'
    ];
    const [analyzingText, setAnalyzingText] = useState(analyzingMessages[0]);

    const TOTAL_STEPS = 3;
    const PAYMENT_URL = 'https://buy.stripe.com/5kQeVe2rT6gD9etfqx2Fa01';

    const endSessionAndReset = useCallback(() => {
        trackEvent('session_reset');
        localStorage.removeItem('analysisSession');
        setAnalysisSession(null);
        window.location.reload();
    }, []);

    const processAnalysisResult = useCallback((result: string, dataToAnalyze: FormData, currentSession: any) => {
        if (result && result.toLowerCase().startsWith('error:')) {
            setError(result);
            setAnalysisResult('');
            setAppState('AWAITING_PAYMENT'); 
        } else if (result) {
            setAnalysisResult(result);
            const updatedSession = { ...currentSession, result, formData: dataToAnalyze };
            setAnalysisSession(updatedSession);
            localStorage.setItem('analysisSession', JSON.stringify(updatedSession));
            setAppState('RESULT');
        } else {
            setError("The analysis returned an empty result. This might be due to a temporary issue with the AI model or a problem with authorization. Please try again.");
            setAppState('AWAITING_PAYMENT');
        }
    }, []);
    
    const runAnalysis = useCallback(async (dataToAnalyze: FormData, currentSession: any) => {
        if (!currentSession) {
            setError("Your session has expired. Please start a new analysis.");
            endSessionAndReset();
            return;
        }
        setAppState('ANALYZING');
        try {
            const result = await analyzeLabResults(dataToAnalyze);
            processAnalysisResult(result, dataToAnalyze, currentSession);
        } catch (err) {
            setError('An unexpected error occurred during analysis. Please try again.');
            console.error(err);
            setAppState('AWAITING_PAYMENT');
        }
    }, [endSessionAndReset, processAnalysisResult]);

    useEffect(() => {
        trackEvent('page_view');
    }, []);

    useEffect(() => {
        if (appState === 'ANALYZING') {
            let messageIndex = 0;
            const intervalId = setInterval(() => {
                messageIndex = (messageIndex + 1) % analyzingMessages.length;
                setAnalyzingText(analyzingMessages[messageIndex]);
            }, 2500); // Change message every 2.5 seconds

            return () => clearInterval(intervalId);
        }
    }, [appState, analyzingMessages]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const stripeSessionId = urlParams.get('session_id');
        const storedSessionJSON = localStorage.getItem('analysisSession');

        if (stripeSessionId?.startsWith('cs_') && storedSessionJSON) {
            setAppState('VERIFYING_PAYMENT');
            trackEvent('purchase_completed', { stripe_session_id: stripeSessionId });
            window.history.replaceState({}, document.title, window.location.pathname);
            try {
                const session = JSON.parse(storedSessionJSON);
                if (session.expiry > Date.now() && !session.result) {
                    const updatedSession = { ...session, paymentConfirmed: true };
                    localStorage.setItem('analysisSession', JSON.stringify(updatedSession));
                    setAnalysisSession(updatedSession);
                    setFormData(updatedSession.formData);
                    runAnalysis(updatedSession.formData, updatedSession);
                    return;
                }
            } catch (e) {
                console.error("Error handling payment redirect:", e);
                setAppState('AWAITING_PAYMENT');
            }
        }
        else if (storedSessionJSON) {
            try {
                const session = JSON.parse(storedSessionJSON);
                if (session.expiry > Date.now()) {
                    setAnalysisSession(session);
                    setFormData(session.formData);
                    if (session.result) {
                        setAnalysisResult(session.result);
                        setAppState('RESULT');
                    } else {
                        setAppState('AWAITING_PAYMENT');
                    }
                } else {
                    localStorage.removeItem('analysisSession');
                }
            } catch (e) {
                console.error("Failed to parse analysis session:", e);
                localStorage.removeItem('analysisSession');
            }
        }
    }, [runAnalysis]);

    const handleNext = () => currentStep < TOTAL_STEPS && setCurrentStep(currentStep + 1);
    const handleBack = () => currentStep > 1 && setCurrentStep(currentStep - 1);
    const handleLabChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, labs: { ...prev.labs, [e.target.name]: e.target.value } }));
    const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, injectionFrequency: e.target.value }));
    const handleTimingChange = (e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, bloodTestTiming: e.target.value }));
    const handleSymptomChange = (symptoms: string[]) => setFormData(prev => ({ ...prev, symptoms }));
    
    const handleFinalizeAndAnalyze = () => {
        const url = confirmationUrl.trim();
        if (!url) {
            setError("Please paste the confirmation URL from Stripe to verify your purchase.");
            return;
        }
        
        const match = url.match(/(cs_(live|test)_[a-zA-Z0-9]+)/);
        const potentialSessionId = match ? match[0] : null;

        if (potentialSessionId && analysisSession) {
            setError('');
            trackEvent('purchase_verified_manually');
            const updatedSession = { ...analysisSession, paymentConfirmed: true };
            localStorage.setItem('analysisSession', JSON.stringify(updatedSession));
            setAnalysisSession(updatedSession);
            runAnalysis(formData, updatedSession);
        } else {
            let errorMsg = "Could not find a valid Stripe Session ID in the URL. Please ensure you copied the entire address from the Stripe confirmation page.";
            if (!analysisSession) {
                errorMsg += " Your session may have also expired. Please start over."
            }
            setError(errorMsg);
        }
    };

    const handleAttemptAnalysis = () => {
        if (!formData.labs.freeTestosterone || !formData.labs.estradiol || !formData.labs.hematocrit) {
            setError('Please fill in at least Free T, Estradiol, and Hematocrit values.');
            return;
        }
        setError('');
        trackEvent('analysis_attempt');
        
        let sessionToUse = analysisSession;
        if (!sessionToUse || sessionToUse.expiry < Date.now()) {
            const newSession = {
                token: crypto.randomUUID(),
                expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
                formData: formData,
            };
            setAnalysisSession(newSession);
            localStorage.setItem('analysisSession', JSON.stringify(newSession));
            sessionToUse = newSession;
        } else {
            const updatedSession = { ...sessionToUse, formData: formData };
            setAnalysisSession(updatedSession);
            localStorage.setItem('analysisSession', JSON.stringify(updatedSession));
            sessionToUse = updatedSession;
        }
        
        if (sessionToUse.paymentConfirmed) {
            runAnalysis(formData, sessionToUse);
        } else {
            setAppState('AWAITING_PAYMENT');
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1: return (
                <div>
                    <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Your Protocol</h2>
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="injectionFrequency" className="block text-sm font-medium text-gray-400 mb-2">How often do you inject testosterone?</label>
                            <select id="injectionFrequency" value={formData.injectionFrequency} onChange={handleFrequencyChange} className="w-full bg-gray-900/50 border-gray-700 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 transition border">
                                <option value="">Select frequency...</option>
                                {Object.values(InjectionFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="bloodTestTiming" className="block text-sm font-medium text-gray-400 mb-2">When was this blood test taken relative to your injection?</label>
                            <select id="bloodTestTiming" value={formData.bloodTestTiming} onChange={handleTimingChange} className="w-full bg-gray-900/50 border-gray-700 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 transition border">
                                <option value="">Select timing...</option>
                                {Object.values(BloodTestTiming).map(time => <option key={time} value={time}>{time}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            );
            case 2: return (
                <div>
                    <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Your Lab Results</h2>
                    <p className="text-center text-gray-400 mb-6 text-sm">Enter the values exactly as they appear on your report. The AI is trained to handle various units.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                        <div>
                            <label htmlFor="totalTestosterone" className="block text-sm font-medium text-gray-400 mb-2">Total Testosterone (Optional)</label>
                            <input type="text" pattern="[0-9]*" name="totalTestosterone" id="totalTestosterone" value={formData.labs.totalTestosterone} onChange={handleLabChange} className="w-full bg-gray-900/50 border-gray-700 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 transition border" placeholder="e.g., 850" />
                        </div>
                        <div>
                            <label htmlFor="freeTestosterone" className="block text-sm font-medium text-gray-400 mb-2">Free Testosterone <span className="text-red-400">*</span></label>
                            <input type="text" pattern="[0-9]*" name="freeTestosterone" id="freeTestosterone" value={formData.labs.freeTestosterone} onChange={handleLabChange} className="w-full bg-gray-900/50 border-gray-700 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 transition border" placeholder="e.g., 25" required />
                        </div>
                        <div>
                            <label htmlFor="estradiol" className="block text-sm font-medium text-gray-400 mb-2">Estradiol (Sensitive) <span className="text-red-400">*</span></label>
                            <input type="text" pattern="[0-9]*" name="estradiol" id="estradiol" value={formData.labs.estradiol} onChange={handleLabChange} className="w-full bg-gray-900/50 border-gray-700 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 transition border" placeholder="e.g., 35" required />
                        </div>
                        <div>
                            <label htmlFor="hematocrit" className="block text-sm font-medium text-gray-400 mb-2">Hematocrit <span className="text-red-400">*</span></label>
                            <input type="text" pattern="[0-9.]*" name="hematocrit" id="hematocrit" value={formData.labs.hematocrit} onChange={handleLabChange} className="w-full bg-gray-900/50 border-gray-700 text-white rounded-lg p-3 focus:ring-cyan-500 focus:border-cyan-500 transition border" placeholder="e.g., 48.5" required />
                        </div>
                    </div>
                </div>
            );
            case 3: return (
                 <div>
                    <h2 className="text-2xl font-bold text-center text-gray-100 mb-6">Your Current Symptoms</h2>
                    <p className="text-center text-gray-400 mb-6 text-sm">Select any symptoms you're currently experiencing. This provides crucial context for the analysis.</p>
                    <SymptomsSelector selectedSymptoms={formData.symptoms} onChange={handleSymptomChange} />
                </div>
            );
            default: return null;
        }
    };

    return (
        <div className="bg-transparent text-white min-h-screen font-sans p-4 sm:p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3">
                        <SparklesIcon className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">
                            TRT Lab Analyzer
                        </h1>
                    </div>
                     <p className="text-gray-400 mt-2">Powered by Dr. T's Expert Methodology</p>
                </header>

                {appState === 'INTRO' && (
                    <div className="bg-gray-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-2xl text-center animate-slide-up border border-cyan-500/20">
                        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400">Turn Lab Numbers into Actionable Insights</h2>
                        <p className="text-gray-300 mt-4 leading-relaxed max-w-prose mx-auto">
                           Stop guessing. Get a breakdown of your TRT labs powered by Dr. T's expert methodology and receive clear, personalized discussion points to share with your doctor.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left my-8">
                           <div className="bg-black/20 p-4 rounded-lg border border-gray-700/50"><strong>1. Input Your Data:</strong> Securely enter your current protocol, key lab values, and any symptoms.</div>
                           <div className="bg-black/20 p-4 rounded-lg border border-gray-700/50"><strong>2. Get Your Analysis:</strong> Our system analyzes your data to identify areas for optimization.</div>
                           <div className="bg-black/20 p-4 rounded-lg border border-gray-700/50"><strong>3. Empower Your Doctor Visit:</strong> Receive a personalized guide for your next appointment.</div>
                        </div>
                        <button onClick={() => { setAppState('FORM'); trackEvent('analysis_started'); }} className="bg-cyan-600/20 border border-cyan-500 text-cyan-300 hover:bg-cyan-500/30 hover:text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg w-full sm:w-auto animate-glow">
                            Start My Analysis
                        </button>
                    </div>
                )}
                
                {appState === 'FORM' && (
                    <div className="bg-gray-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-2xl animate-slide-up border border-cyan-500/20">
                        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
                        {error && <p className="text-red-400 bg-red-900/50 border border-red-700 rounded-md p-3 text-center mb-6">{error}</p>}
                        <div className="min-h-[300px]">
                          {renderStepContent()}
                        </div>
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
                            <button onClick={handleBack} disabled={currentStep === 1} className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 border border-gray-600 hover:bg-gray-600/50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                <ChevronLeftIcon className="w-5 h-5" /> Back
                            </button>
                            {currentStep < TOTAL_STEPS ? (
                                <button onClick={handleNext} className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500 text-cyan-300 hover:bg-cyan-500/30 rounded-lg transition-colors">
                                    Next <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            ) : (
                                <button onClick={handleAttemptAnalysis} className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500 text-cyan-300 hover:bg-cyan-500/30 rounded-lg font-bold transition-colors animate-glow">
                                    <SparklesIcon className="w-5 h-5" /> Finalize & Analyze
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {appState === 'AWAITING_PAYMENT' && (
                     <div className="bg-gray-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg mx-auto w-full animate-slide-up border border-cyan-500/20">
                        <div className="text-center">
                            <CreditCardIcon className="w-12 h-12 mx-auto text-cyan-400" />
                            <h2 className="text-2xl font-bold mt-4">One-Time Payment Required</h2>
                        </div>
                        <p className="text-center text-gray-300 mt-4">
                            Your lab results are ready for a detailed analysis. Complete the secure payment to receive your personalized report.
                        </p>
                        <div className="bg-black/20 p-4 rounded-lg my-6 text-center border border-gray-700/50">
                            <span className="text-3xl font-bold text-white">$10.00</span>
                            <span className="text-gray-400"> / one-time analysis</span>
                        </div>
                        <a href={PAYMENT_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('payment_initiated')} className="flex items-center justify-center w-full gap-3 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                           <ShieldCheckIcon className="w-6 h-6" /> Proceed to Secure Payment
                        </a>
                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-gray-600"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-sm">After you pay</span>
                            <div className="flex-grow border-t border-gray-600"></div>
                        </div>
                        <div className="mt-2 text-center text-gray-400 text-sm space-y-2">
                             <p>1. You will be redirected to Stripe to pay.</p>
                             <p>2. After paying, come back. Your analysis should start automatically.</p>
                             <p className="text-xs text-gray-500 mt-2">If it doesn't, your session was restored and is ready.</p>
                        </div>
                         {error && <p className="text-red-400 text-center text-sm mt-4">{error}</p>}
                         <div className="text-center mt-6">
                            <button 
                                onClick={endSessionAndReset}
                                className="text-sm text-gray-400 hover:text-white hover:underline transition-colors"
                            >
                                Or, start a new analysis
                            </button>
                        </div>
                         <p className="text-xs text-gray-500 text-center mt-6">
                            Need help? <a href="mailto:support@email.com" className="underline hover:text-gray-400">Contact Support</a>.
                        </p>
                    </div>
                )}

                {(appState === 'VERIFYING_PAYMENT' || appState === 'ANALYZING') && (
                    <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-xl shadow-2xl text-center animate-fade-in border border-cyan-500/20">
                        <SparklesIcon className="w-12 h-12 mx-auto text-cyan-400 animate-pulse-icon" />
                        <h2 className="text-2xl font-bold mt-4">Analyzing Your Results...</h2>
                        <p className="text-gray-300 mt-2 transition-opacity duration-500" key={analyzingText}>{analyzingText}</p>
                        <div className="w-full bg-gray-800/50 rounded-full h-2.5 mt-6 overflow-hidden border border-cyan-500/20">
                          <div className="bg-cyan-500 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
                        </div>
                    </div>
                )}

                {appState === 'RESULT' && (
                   <ResultDisplay result={analysisResult} />
                )}
            </div>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);