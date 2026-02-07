import React, { useState, useEffect } from 'react';
import { uploadBaselineCV, getBaselineCV } from '../services/api';

function BaselineCV() {
    const [baselineCV, setBaselineCV] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        loadBaselineCV();
    }, []);

    const loadBaselineCV = async () => {
        try {
            const data = await getBaselineCV();
            setBaselineCV(data);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error loading baseline CV:', error);
            }
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        if (!file.name.endsWith('.tex')) {
            setMessage({ type: 'error', text: 'Please upload a .tex file' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await uploadBaselineCV(file);
            setMessage({ type: 'success', text: response.message });
            await loadBaselineCV();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to upload CV'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-900 mb-2">Baseline CV Template</h2>
                <p className="text-gray-600">
                    Upload your LaTeX CV template. This will serve as the foundation for all generated CVs.
                </p>
            </div>

            {/* Upload Section */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Upload LaTeX CV</h3>

                <div
                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                        ? 'border-gray-400 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="cv-upload"
                        className="hidden"
                        accept=".tex"
                        onChange={handleChange}
                        disabled={loading}
                    />

                    <label
                        htmlFor="cv-upload"
                        className="cursor-pointer"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Drop your .tex file here or click to browse
                        </p>
                        <p className="text-sm text-gray-600">
                            Supports LaTeX (.tex) files only
                        </p>
                    </label>
                </div>

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

                {loading && (
                    <div className="mt-4 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="mt-2 text-gray-600">Uploading...</p>
                    </div>
                )}
            </div>

            {/* Preview Section */}
            {baselineCV && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-medium text-gray-900">Current Baseline CV</h3>
                        {baselineCV.uploaded_at && (
                            <span className="text-sm text-gray-500">
                                Uploaded: {new Date(baselineCV.uploaded_at).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200">
                        <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                            {baselineCV.content}
                        </pre>
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => {
                                const blob = new Blob([baselineCV.content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'baseline_cv.tex';
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                            Download Current Template
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BaselineCV;
