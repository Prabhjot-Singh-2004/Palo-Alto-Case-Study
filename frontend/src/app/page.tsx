'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { resumeApi } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

const ROLES = [
  'SDE 1',
  'Full Stack Developer',
  'Data Engineer',
  'Cloud Architect',
];

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setSession } = useAppStore();

  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const targetRole = selectedRole === 'custom' ? customRole : selectedRole;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Please upload a PDF file');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !targetRole) {
      toast.error('Please select a role and upload your resume');
      return;
    }

    setUploading(true);
    try {
      const response = await resumeApi.upload(file, targetRole);
      setSession(
        response.data.sessionId,
        response.data.targetRole,
        response.data.rawText
      );
      toast.success('Resume uploaded successfully!');
      router.push('/analysis');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Toaster position="top-right" />

      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bridge the Gap to Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Dream Career
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your resume, choose your target role, and get a personalized
          learning roadmap powered by AI.
        </p>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Get Started
        </h2>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Role
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all ${
                  selectedRole === role
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          <div className="mt-3">
            <button
              onClick={() => setSelectedRole('custom')}
              className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                selectedRole === 'custom'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              + Custom role
            </button>
            {selectedRole === 'custom' && (
              <input
                type="text"
                placeholder="Enter target role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm"
              />
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Upload Resume (PDF)
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div>
                <div className="text-3xl mb-2">📄</div>
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-xs text-indigo-600 mt-2">Click to change</p>
              </div>
            ) : (
              <div>
                <div className="text-3xl mb-2">☁️</div>
                <p className="font-medium text-gray-700">
                  Drag and drop your resume here
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (PDF only, max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={!file || !targetRole || uploading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Parsing Resume...
            </span>
          ) : (
            'Analyze My Skills'
          )}
        </button>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {[
          {
            icon: '🎯',
            title: 'Gap Analysis',
            desc: 'See exactly which skills you have and what you need to learn.',
          },
          {
            icon: '🗺️',
            title: 'Learning Roadmap',
            desc: 'Get a personalized week-by-week plan with curated resources.',
          },
          {
            icon: '🎤',
            title: 'Mock Interviews',
            desc: 'Practice with AI-generated questions based on your existing skills.',
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center"
          >
            <div className="text-3xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
            <p className="text-sm text-gray-500 mt-2">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
