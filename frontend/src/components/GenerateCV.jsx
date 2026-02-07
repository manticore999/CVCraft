import React, { useState } from 'react';
import { generateCV } from '../services/api';

function GenerateCV() {
    const [formData, setFormData] = useState({
        jobDescription: '',
        company: '',
        position: '',
        maxItems: 5,
        customInstructions: ''
    });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.jobDescription.trim()) {
            setMessage({ type: 'error', text: 'Please enter a job description' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });
        setResult(null);

        try {
            const response = await generateCV(
                formData.jobDescription,
                formData.company,
                formData.position,
                formData.maxItems,
                formData.customInstructions
            );

            setResult(response);
            setMessage({ type: 'success', text: 'CV generated successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to generate CV. Please check your baseline CV and projects.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;

        const blob = new Blob([result.latex_content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cv_${result.job_id}.tex`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyToClipboard = () => {
        if (!result) return;

        navigator.clipboard.writeText(result.latex_content);
        setMessage({ type: 'success', text: 'LaTeX code copied to clipboard!' });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">Generate Tailored CV</h2>
                <p className="text-gray-600">
                    Enter a job description and let AI tailor your CV to match the requirements
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Job Details</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Google, Microsoft"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Position (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Senior Software Engineer"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Description *
                            </label>
                            <textarea
                                required
                                rows="12"
                                placeholder="Paste the complete job description here..."
                                value={formData.jobDescription}
                                onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Include requirements, responsibilities, and preferred qualifications
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Projects/Experiences to Include
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={formData.maxItems}
                                onChange={(e) => setFormData({ ...formData, maxItems: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Custom Instructions (optional)
                            </label>
                            <textarea
                                rows="4"
                                placeholder="Add specific instructions for the AI (e.g., 'Emphasize leadership skills', 'Focus on cloud architecture experience', 'Keep it concise')..."
                                value={formData.customInstructions}
                                onChange={(e) => setFormData({ ...formData, customInstructions: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-gray-300 text-gray-900 rounded-md focus:ring-2 focus:ring-gray-400 focus:border-gray-400 placeholder-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Tell the AI any specific requirements or preferences for this CV
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating CV...
                                </span>
                            ) : (
                                'Generate Tailored CV'
                            )}
                        </button>
                    </form>

                    {message.text && (
                        <div
                            className={`mt-4 p-4 rounded-lg ${message.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                        >
                            {message.text}
                        </div>
                    )}
                </div>

                {/* Result Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Generated CV</h3>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                            <svg className="w-16 h-16 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                            </svg>
                            <p className="text-lg font-medium">AI is crafting your perfect CV...</p>
                            <p className="text-sm mt-2">This may take 10-30 seconds</p>
                        </div>
                    ) : result ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <div className="text-sm text-gray-600">
                                    <p>Job ID: <span className="font-mono">{result.job_id}</span></p>
                                    <p>Generated: {new Date(result.generated_at).toLocaleString()}</p>
                                    {result.selected_items.length > 0 && (
                                        <p>Selected {result.selected_items.length} projects</p>
                                    )}
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={copyToClipboard}
                                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm border border-gray-300"
                                        title="Copy to clipboard"
                                    >
                                        Copy
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm shadow-sm"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 max-h-[600px] overflow-y-auto">
                                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                                    {result.latex_content}
                                </pre>
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Next Steps:</strong> Download the .tex file and compile it with your LaTeX editor
                                    (e.g., Overleaf, TeXShop) to generate a PDF.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg">Your generated CV will appear here</p>
                            <p className="text-sm mt-2">Fill in the job details and click Generate</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GenerateCV;
