'use client';

interface FallbackUIProps {
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}

export default function FallbackUI({ message, onRetry, retrying }: FallbackUIProps) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">☕</div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900">AI Taking a Break</h3>
          <p className="text-amber-700 mt-1 text-sm">{message}</p>
          <p className="text-amber-600 mt-2 text-sm">
            Don&apos;t worry! We&apos;ve provided basic results using our database. You can retry the full AI analysis anytime.
          </p>
          <button
            onClick={onRetry}
            disabled={retrying}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {retrying ? 'Retrying...' : 'Retry AI Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}
