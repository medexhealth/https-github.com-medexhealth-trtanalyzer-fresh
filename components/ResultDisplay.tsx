import React from 'react';
import { Markdown } from './Markdown';

export const ResultDisplay = ({ result }: { result: string }) => {
    if (!result) return null;
    return (
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Analysis Report</h2>
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                <Markdown content={result} />
            </div>
        </div>
    );
};
