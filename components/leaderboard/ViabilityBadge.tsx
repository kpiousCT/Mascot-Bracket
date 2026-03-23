import type { BracketViability } from '@/lib/types';

interface ViabilityBadgeProps {
  viability: BracketViability | null;
  compact?: boolean;
}

export function ViabilityBadge({ viability, compact = false }: ViabilityBadgeProps) {
  if (!viability) {
    return null;
  }

  const championEliminated = viability.status === 'eliminated' || !viability.championStillAlive;

  if (viability.status === 'eliminated') {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex flex-col gap-0.5`}>
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">
          {viability.finalFourAliveCount}/4 Final Four Left
        </span>
        {championEliminated && (
          <span className="text-xs text-red-600">
            Champion eliminated
          </span>
        )}
      </div>
    );
  }

  // Show different badges based on Final Four status
  if (viability.finalFourAliveCount === 4) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex flex-col gap-0.5`}>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
          4/4 Final Four Left
        </span>
        <span className="text-xs text-green-600">
          Champion alive
        </span>
      </div>
    );
  }

  if (viability.finalFourAliveCount >= 2) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex flex-col gap-0.5`}>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
          {viability.finalFourAliveCount}/4 Final Four Left
        </span>
        <span className="text-xs text-green-600">
          {championEliminated ? 'Champion eliminated' : 'Champion alive'}
        </span>
      </div>
    );
  }

  if (viability.finalFourAliveCount === 1) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex flex-col gap-0.5`}>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">
          1/4 Final Four Left
        </span>
        <span className="text-xs text-yellow-700">
          {championEliminated ? 'Champion eliminated' : 'Champion alive'}
        </span>
      </div>
    );
  }

  // 0 Final Four left
  return (
    <div className={`${compact ? 'text-xs' : 'text-sm'} flex flex-col gap-0.5`}>
      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">
        0/4 Final Four Left
      </span>
      <span className="text-xs text-orange-700">
        {championEliminated ? 'Champion eliminated' : 'Long shot remaining'}
      </span>
    </div>
  );
}
