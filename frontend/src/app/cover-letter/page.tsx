'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { coverLetterApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

export default function CoverLetterPage() {
  const router = useRouter();
  const {
    sessionId,
    targetRole,
    coverLetter,
    coverLetterStatus,
    setCoverLetterLoading,
    setCoverLetterError,
    setCoverLetterResult,
  } = useAppStore();

  const [jobDescription, setJobDescription] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!sessionId) router.push('/');
  }, [sessionId]);

  const handleGenerate = async () => {
    if (!sessionId || !jobDescription.trim()) {
      toast.error('Please paste a job description');
      return;
    }
    setCoverLetterLoading();
    try {
      const response = await coverLetterApi.generate(sessionId, jobDescription);
      setCoverLetterResult(response.data.coverLetter, response.fallback ? 'fallback' : 'completed');
    } catch {
      setCoverLetterError();
      toast.error('Generation failed. Please try again.');
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (coverLetter) {
      const blob = new Blob([coverLetter], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cover-letter.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!sessionId) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster position="top-right" />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cover Letter Generator</h1>
        <p className="text-gray-500 mt-1">
          Generate a tailored cover letter using your resume and a job description
        </p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to generate a tailored cover letter..."
          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-gray-400">{jobDescription.length} characters</p>
          <button
            onClick={handleGenerate}
            disabled={!jobDescription.trim() || coverLetterStatus === 'loading'}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {coverLetterStatus === 'loading' ? 'Generating...' : 'Generate Cover Letter'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {coverLetterStatus === 'loading' && (
        <div className="flex flex-col items-center py-16">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-600 font-medium">Crafting your cover letter...</p>
        </div>
      )}

      {/* Error */}
      {coverLetterStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-medium">Generation failed</p>
          <button
            onClick={handleGenerate}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Result */}
      {(coverLetterStatus === 'completed' || coverLetterStatus === 'fallback') && coverLetter && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Your Cover Letter</h3>
              {coverLetterStatus === 'fallback' && (
                <p className="text-xs text-amber-600 mt-0.5">Generated with basic template (AI unavailable)</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed text-sm">
              {coverLetter}
            </div>
          </div>
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <button
              onClick={() => setJobDescription('')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Generate another for a different JD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
