'use client';

import Link from 'next/link';

interface NavigationControlsProps {
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isSaving: boolean;
  userName: string;
}

export function NavigationControls({
  onPrevious,
  onNext,
  onSave,
  canGoPrevious,
  canGoNext,
  isSaving,
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
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`
            flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold
            transition-all duration-200
            ${isSaving
              ? 'bg-green-500 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white hover:scale-105'
            }
          `}
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>Save Progress</span>
            </>
          )}
        </button>

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
