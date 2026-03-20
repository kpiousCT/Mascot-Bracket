import type { DailyRecap } from '@/lib/types';

interface DailyRecapCardProps {
  recap: DailyRecap;
}

export function DailyRecapCard({ recap }: DailyRecapCardProps) {
  const date = new Date(recap.recap_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-2xl font-bold text-blue-900">{formattedDate}</h3>
          <p className="text-sm text-gray-500">
            Tournament Day Recap
          </p>
        </div>
        <div className="text-sm text-gray-600">
          {recap.total_games_completed} total games
        </div>
      </div>

      {/* Summary Text */}
      {recap.summary_text && (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">{recap.summary_text}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-3xl font-bold text-blue-600">
            {recap.games_completed_today}
          </div>
          <div className="text-sm text-gray-600 mt-1">Games Today</div>
        </div>

        {recap.biggest_upset && (
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-xl font-bold text-orange-900">
              {recap.biggest_upset_seed_diff} Seed
            </div>
            <div className="text-sm text-gray-600 mt-1">Biggest Upset</div>
            <div className="text-xs text-gray-500 mt-2 line-clamp-2">
              {recap.biggest_upset}
            </div>
          </div>
        )}

        {recap.biggest_rank_change && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-xl font-bold text-purple-900">
              {Math.abs(recap.biggest_rank_change.change)} Spots
            </div>
            <div className="text-sm text-gray-600 mt-1">Biggest Mover</div>
            <div className="text-xs text-gray-500 mt-2">
              {recap.biggest_rank_change.user}
            </div>
          </div>
        )}

        {recap.new_eliminations > 0 && (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-3xl font-bold text-red-600">
              {recap.new_eliminations}
            </div>
            <div className="text-sm text-gray-600 mt-1">Eliminated</div>
          </div>
        )}
      </div>

      {/* Eliminated Brackets List */}
      {recap.eliminated_brackets && recap.eliminated_brackets.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">
            Championship Hopes Dashed:
          </h4>
          <div className="flex flex-wrap gap-2">
            {recap.eliminated_brackets.map((user, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
              >
                {user}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
