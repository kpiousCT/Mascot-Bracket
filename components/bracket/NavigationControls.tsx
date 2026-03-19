'use client';

import Link from 'next/link';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  userName: string;
}

export function NavigationControls({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  userName
}: NavigationControlsProps) {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6 space-y-4">
      {/* Main navigation buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`
            flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
            transition-all duration-200
            ${canGoPrevious
              ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Previous</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-lg
            transition-all duration-200
            ${canGoNext
              ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          <span>Next</span>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Secondary actions */}
      <div className="flex justify-center">
        <Link
          href={`/bracket/overview?userName=${encodeURIComponent(userName)}`}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all duration-200 hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
          <span>View Full Bracket</span>
        </Link>
      </div>

      {/* Helper text */}
      <div className="text-center text-sm text-gray-500">
        Use ← → arrow keys to navigate
      </div>
    </div>
  );
}
