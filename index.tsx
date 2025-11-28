import React, { useState, useCallback, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- TYPES (as plain JS Objects) ---
const InjectionFrequency = {
  ONCE_A_WEEK: 'Once a week',
  TWICE_A_WEEK: 'Twice a week',
  THREE_TIMES_A_WEEK: 'Three times a week or more',
  OTHER: 'Other',
};

const BloodTestTiming = {
  PEAK: 'Peak (1-2 days after injection)',
  MID: 'Mid-cycle (3-5 days after injection)',
  TROUGH: 'Trough (day of next injection, before injecting)',
  UNSURE: 'Unsure',
};

// --- ANALYTICS ---
const trackEvent = (eventName, properties = {}) => {
  console.log(`[Analytics] Event: ${eventName}`, properties);
  // In a real-world scenario, this would send data to an analytics service like Google Analytics, PostHog, etc.
};


// --- SECURE ANALYSIS SERVICE ---
const analyzeLabResults = async (formData) => {
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
const ChevronLeftIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);
const ChevronRightIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);
const SparklesIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);
const CreditCardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.5 3.75h15a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 21Z" />
    </svg>
);
const ShieldCheckIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z" />
    </svg>
);
const CheckIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const ClipboardIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
    </svg>
);
const ArrowPathIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 11.667 0l3.181-3.183m-4.991-2.696v4.992h-4.992m0 0-3.181-3.183a8.25 8.25 0 0 1 11.667 0l3.181 3.183" />
    </svg>
);


// --- UI COMPONENTS (Re-integrated) ---

const Markdown = ({ content }) => {
    const lines = content.split('\n');
    let html = '';
    let inList = false;

    const processInline = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

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

const ResultDisplay = ({ result, onReset }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const guideTitle = "### Your Personalized Doctor Discussion Guide";
        const disclaimerTitle = "### Important Disclaimer";

        const startIndex = result.indexOf(guideTitle);
        
        if (startIndex === -1) {
            console.error("Could not find the discussion guide section to copy.");
            // Fallback to copying entire text if guide isn't found
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
        <div className="animate-fade-in">
            <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-lg shadow-2xl border border-cyan-500/20">
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
            <div className="mt-6 text-center">
                <button 
                    onClick={onReset}
                    className="flex items-center justify-center w-full sm:w-auto mx-auto gap-2 px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-white rounded-lg transition-colors duration-200"
                >
                    <ArrowPathIcon className="w-5 h-5" /> Start New Analysis
                </button>
            </div>
        </div>
    );
};

const StepIndicator = ({ currentStep, totalSteps }) => (
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

const SymptomsSelector = ({ selectedSymptoms, onChange }) => {
    const handleSymptomToggle = (symptom) => {
        let newSelection;
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
    const [appState, setAppState] = useState('INTRO');
    const [currentStep, setCurrentStep] = useState(1);
    const [analysisSession, setAnalysisSession] = useState(null);
    
    const [formData, setFormData] = useState({
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
        localStorage.removeItem('analysisSession');
        setAnalysisSession(null);
        window.location.reload();
    }, []);

    const handleResetWithConfirmation = () => {
        const userConfirmed = window.confirm(
            "Are you sure you want to start a new analysis? Your current report will be cleared from this browser session."
        );
        if (userConfirmed) {
            trackEvent('session_reset_confirmed');
            endSessionAndReset();
        } else {
            trackEvent('session_reset_cancelled');
        }
    };

    const processAnalysisResult = useCallback((result, dataToAnalyze, currentSession) => {
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
    
    const runAnalysis = useCallback(async (dataToAnalyze, currentSession) => {
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
    const handleLabChange = (e) => setFormData(prev => ({ ...prev, labs: { ...prev.labs, [e.target.name]: e.target.value } }));
    const handleFrequencyChange = (e) => setFormData(prev => ({ ...prev, injectionFrequency: e.target.value }));
    const handleTimingChange = (e) => setFormData(prev => ({ ...prev, bloodTestTiming: e.target.value }));
    const handleSymptomChange = (symptoms) => setFormData(prev => ({ ...prev, symptoms }));
    
    const handleAttemptAnalysis = () => {
        if (!formData.labs.freeTestosterone || !formData.labs.estradiol || !formData.labs.hematocrit) {
            setError('Please fill in at least Free T, Estradiol, and Hematocrit values.');
            return;
        }
        setError('');
        trackEvent('analysis_attempt');
        
        const newSession = {
            token: crypto.randomUUID(),
            expiry: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            paymentConfirmed: false,
            formData: formData,
        };
        setAnalysisSession(newSession);
        localStorage.setItem('analysisSession', JSON.stringify(newSession));
        setAppState('AWAITING_PAYMENT');
    };

    const renderContent = () => {
        switch (appState) {
            case 'INTRO':
                return (
                    <div className="text-center animate-fade-in">
                        <h1 className="text-4xl sm:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 to-blue-500 mb-4">TRT Lab Analyzer</h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">Get an AI-powered analysis of your TRT lab results. A one-time payment unlocks your personalized report, designed to help you prepare for a discussion with your doctor. This is not medical advice.</p>
                        <button onClick={() => { setAppState('FORM'); trackEvent('start_analysis_clicked'); }} className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-bold text-white bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-lg hover:shadow-cyan-500/50 transition-shadow duration-300">
                            <SparklesIcon className="w-6 h-6 mr-3 transform transition-transform duration-300 group-hover:rotate-12" />
                            Start Analysis & Get Report
                        </button>
                    </div>
                );
            case 'FORM':
                return (
                    <div className="w-full max-w-2xl mx-auto animate-fade-in">
                        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
                        <div className="bg-gray-900/50 backdrop-blur-xl p-6 sm:p-8 rounded-lg shadow-2xl border border-cyan-500/20">
                            {error && <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded-lg mb-6 text-sm">{error}</div>}
                            
                            {currentStep === 1 && (
                                <div className="animate-slide-up">
                                    <h2 className="text-2xl font-bold text-cyan-400 mb-1">Your Protocol</h2>
                                    <p className="text-gray-400 mb-6">Tell us about your current TRT regimen.</p>
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="injectionFrequency" className="block text-sm font-medium text-gray-300 mb-2">How often do you inject Testosterone?</label>
                                            <select id="injectionFrequency" name="injectionFrequency" value={formData.injectionFrequency} onChange={handleFrequencyChange} className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="">Select frequency...</option>
                                                {Object.values(InjectionFrequency).map(freq => <option key={freq} value={freq}>{freq}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="bloodTestTiming" className="block text-sm font-medium text-gray-300 mb-2">When was this blood test taken relative to your injection?</label>
                                            <select id="bloodTestTiming" name="bloodTestTiming" value={formData.bloodTestTiming} onChange={handleTimingChange} className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition">
                                                <option value="">Select timing...</option>
                                                {Object.values(BloodTestTiming).map(time => <option key={time} value={time}>{time}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="animate-slide-up">
                                    <h2 className="text-2xl font-bold text-cyan-400 mb-1">Your Lab Results</h2>
                                    <p className="text-gray-400 mb-6">Enter your most recent bloodwork values.</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                                        <div>
                                            <label htmlFor="totalTestosterone" className="block text-sm font-medium text-gray-300 mb-2">Total T <span className="text-gray-500">(ng/dL)</span></label>
                                            <input type="number" min="0" name="totalTestosterone" id="totalTestosterone" value={formData.labs.totalTestosterone} onChange={handleLabChange} className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="e.g., 850" />
                                        </div>
                                        <div>
                                            <label htmlFor="freeTestosterone" className="block text-sm font-medium text-gray-300 mb-2">Free T <span className="text-gray-500">(pg/mL) - Required</span></label>
                                            <input type="number" min="0" name="freeTestosterone" id="freeTestosterone" value={formData.labs.freeTestosterone} onChange={handleLabChange} className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="e.g., 25.5" required />
                                        </div>
                                        <div>
                                            <label htmlFor="estradiol" className="block text-sm font-medium text-gray-300 mb-2">Estradiol <span className="text-gray-500">(pg/mL) - Required</span></label>
                                            <input type="number" min="0" name="estradiol" id="estradiol" value={formData.labs.estradiol} onChange={handleLabChange} className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="e.g., 35" required />
                                        </div>
                                        <div>
                                            <label htmlFor="hematocrit" className="block text-sm font-medium text-gray-300 mb-2">Hematocrit <span className="text-gray-500">(%) - Required</span></label>
                                            <input type="number" min="0" name="hematocrit" id="hematocrit" value={formData.labs.hematocrit} onChange={handleLabChange} className="w-full bg-gray-800/70 border border-gray-700 text-white rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" placeholder="e.g., 48.5" required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="animate-slide-up">
                                    <h2 className="text-2xl font-bold text-cyan-400 mb-1">Your Symptoms</h2>
                                    <p className="text-gray-400 mb-6">Select any symptoms you're currently experiencing.</p>
                                    <SymptomsSelector selectedSymptoms={formData.symptoms} onChange={handleSymptomChange} />
                                </div>
                            )}

                            <div className="flex justify-between mt-8">
                                <button onClick={handleBack} disabled={currentStep === 1} className="flex items-center gap-2 px-6 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/50 hover:text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <ChevronLeftIcon className="w-4 h-4" /> Back
                                </button>
                                {currentStep < TOTAL_STEPS ? (
                                    <button onClick={handleNext} className="flex items-center gap-2 px-6 py-2 bg-cyan-600/80 text-white hover:bg-cyan-600 rounded-lg transition-colors duration-200">
                                        Next <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button onClick={handleAttemptAnalysis} className="flex items-center gap-2 px-6 py-2 bg-green-600/80 text-white hover:bg-green-600 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-green-500/40">
                                        <SparklesIcon className="w-5 h-5" /> Get My Analysis
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'AWAITING_PAYMENT':
                return (
                    <div className="w-full max-w-lg mx-auto animate-fade-in text-center">
                        <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-lg shadow-2xl border border-cyan-500/20">
                            <ShieldCheckIcon className="w-16 h-16 mx-auto text-cyan-400 animate-pulse-icon mb-4" />
                            <h2 className="text-2xl font-bold text-cyan-400 mb-2">One-Time Secure Payment</h2>
                            <p className="text-gray-400 mb-6">Your comprehensive lab analysis is ready. A one-time fee of $4.99 unlocks your personalized report.</p>
                            
                            {error && <div className="bg-red-500/20 text-red-300 border border-red-500/50 p-3 rounded-lg mb-6 text-sm text-left">{error}</div>}

                            <a href={PAYMENT_URL} onClick={() => trackEvent('proceed_to_payment')} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-bold rounded-lg shadow-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105">
                                <CreditCardIcon className="w-6 h-6" /> Pay Now & Get Report
                            </a>

                            <div className="text-xs text-gray-500 mt-4">
                                <p>You will be redirected to Stripe for secure payment.</p>
                                <p className="mt-2">Having trouble? <a href="mailto:support@yourapp.com" className="text-cyan-400 hover:underline">Contact Support</a></p>
                            </div>
                        </div>
                    </div>
                );
            case 'VERIFYING_PAYMENT':
                 return (
                    <div className="text-center animate-fade-in">
                        <div className="flex items-center justify-center space-x-3">
                           <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <h2 className="text-2xl font-bold text-cyan-400">Verifying Payment...</h2>
                        </div>
                        <p className="text-gray-400 mt-2">Thank you for your purchase. Please wait while we confirm your transaction.</p>
                    </div>
                );
            case 'ANALYZING':
                return (
                    <div className="text-center animate-fade-in">
                         <div className="flex items-center justify-center space-x-3">
                           <svg className="animate-spin h-8 w-8 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           <h2 className="text-2xl font-bold text-cyan-400">Analyzing Your Results...</h2>
                        </div>
                        <p className="text-gray-400 mt-2 h-6 transition-opacity duration-500">{analyzingText}</p>
                    </div>
                );
            case 'RESULT':
                return <ResultDisplay result={analysisResult} onReset={handleResetWithConfirmation} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
            <main className="w-full max-w-4xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);