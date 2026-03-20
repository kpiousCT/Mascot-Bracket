import { ROUND_NAMES } from '@/lib/types';
import type { RoundStats } from '@/lib/performance/calculator';

interface RoundCardProps {
  round: string;
  stats: RoundStats;
  average: number;
  isBest?: boolean;
  isWorst?: boolean;
}

export function RoundCard({ round, stats, average, isBest, isWorst }: RoundCardProps) {
  const { correct, total, points, percentage } = stats;
  const difference = percentage - average;
  const isAboveAverage = difference > 0;

  // Determine card styling based on performance
  let borderColor = 'border-gray-300';
  let bgColor = 'bg-white';
  let badge = null;

  if (isBest) {
    borderColor = 'border-green-500';
    bgColor = 'bg-green-50';
    badge = <span className="text-xs px-2 py-1 bg-green-600 text-white rounded-full">🏆 Best</span>;
  } else if (isWorst) {
    borderColor = 'border-red-500';
    bgColor = 'bg-red-50';
    badge = <span className="text-xs px-2 py-1 bg-red-600 text-white rounded-full">📉 Worst</span>;
  }

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg shadow p-4 md:p-6 transition-all hover:shadow-lg`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-800">
          {ROUND_NAMES[round as keyof typeof ROUND_NAMES] || round}
        </h3>
        {badge}
      </div>

      <div className="space-y-3">
        {/* Score display */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Your Score</span>
          <span className="font-bold text-xl text-blue-600">
            {correct}/{total}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
            <div
              className={`h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-sm font-semibold ${
                percentage >= 75
                  ? 'bg-green-500'
                  : percentage >= 50
                  ? 'bg-blue-500'
                  : percentage >= 25
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${percentage}%` }}
            >
              {percentage > 15 && `${percentage.toFixed(0)}%`}
            </div>
          </div>
          {percentage <= 15 && percentage > 0 && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>

        {/* Comparison to average */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Pool Average</span>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">{average.toFixed(1)}%</span>
            {difference !== 0 && (
              <span
                className={`text-xs font-semibold ${
                  isAboveAverage ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isAboveAverage ? '↑' : '↓'} {Math.abs(difference).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Points earned */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 text-sm">Points Earned</span>
            <span className="font-bold text-lg text-purple-600">{points} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
