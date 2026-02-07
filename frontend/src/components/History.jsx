import React, { useState, useEffect } from 'react';
import { getCVHistory, downloadGeneratedCV, getGeneratedCVContent } from '../services/api';

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [viewModal, setViewModal] = useState({ isOpen: false, content: '', jobId: '' });
    const [loadingContent, setLoadingContent] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const data = await getCVHistory();
            setHistory(data);
        } catch (error) {
            console.error('Error loading history:', error);
            setMessage({ type: 'error', text: 'Failed to load history' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (jobId) => {
        try {
            const blob = await downloadGeneratedCV(jobId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cv_${jobId}.tex`;
            a.click();
            URL.revokeObjectURL(url);

            setMessage({ type: 'success', text: 'CV downloaded successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to download CV'
            });
        }
    };

    const handleViewCV = async (jobId) => {
        setLoadingContent(true);
        try {
            const data = await getGeneratedCVContent(jobId);
            setViewModal({ isOpen: true, content: data.content, jobId: data.job_id });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.detail || 'Failed to load CV content'
            });
        } finally {
            setLoadingContent(false);
        }
    };

    const closeModal = () => {
        setViewModal({ isOpen: false, content: '', jobId: '' });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(viewModal.content);
        setMessage({ type: 'success', text: 'CV content copied to clipboard!' });
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-2">CV Generation History</h2>
                <p className="text-gray-600">
                    View and download previously generated CVs
                </p>
            </div>

            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                </div>
            ) : history.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No history yet</h3>
                    <p className="text-gray-600 mb-6">
                        Generate your first CV to see it here
                    </p>
                    <a
                        href="/generate"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                        Generate a CV
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => (
                        <div key={item.job_id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="mb-2">
                                        {item.position && (
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {item.position}
                                            </h3>
                                        )}
                                        {item.company && (
                                            <p className="text-gray-600">
                                                {item.company}
                                            </p>
                                        )}
                                        {!item.position && !item.company && (
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Generated CV
                                            </h3>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span>{formatDate(item.generated_at)}</span>
                                        <span className="font-mono">{item.job_id}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleViewCV(item.job_id)}
                                        disabled={loadingContent}
                                        className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 disabled:opacity-50 font-medium"
                                    >
                                        View CV
                                    </button>
                                    <button
                                        onClick={() => handleDownload(item.job_id)}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium"
                                    >
                                        Download
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {history.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-500">
                    Total CVs generated: {history.length}
                </div>
            )}

            {/* View CV Modal */}
            {viewModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-2xl font-semibold text-gray-900">Generated CV Preview</h3>
                                <p className="text-sm text-gray-500 mt-1">Job ID: {viewModal.jobId}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                                    {viewModal.content}
                                </pre>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                            <p className="text-sm text-gray-600">
                                LaTeX format - Compile with your LaTeX editor to generate PDF
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={copyToClipboard}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
                                >
                                    Copy to Clipboard
                                </button>
                                <button
                                    onClick={() => {
                                        handleDownload(viewModal.jobId);
                                        closeModal();
                                    }}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors"
                                >
                                    Download
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default History;
