import type { BracketViability } from '@/lib/types';

interface ViabilityBadgeProps {
  viability: BracketViability | null;
  compact?: boolean;
}

export function ViabilityBadge({ viability, compact = false }: ViabilityBadgeProps) {
  if (!viability) {
    return null;
  }

  if (viability.status === 'eliminated') {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
        <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-semibold">
          ❌ Eliminated
        </span>
      </div>
    );
  }

  // Show different badges based on Final Four status
  if (viability.finalFourAliveCount === 4) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
          🔥 Perfect Final Four
        </span>
      </div>
    );
  }

  if (viability.finalFourAliveCount >= 2) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded font-semibold">
          🏆 Champion Alive ({viability.finalFourAliveCount}/4 F4)
        </span>
      </div>
    );
  }

  if (viability.finalFourAliveCount === 1) {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded font-semibold">
          ⚠️ 1/4 Final Four Left
        </span>
      </div>
    );
  }

  // Champion alive but all Final Four eliminated (can happen if champion comes from unexpected path)
  return (
    <div className={`${compact ? 'text-xs' : 'text-sm'} flex items-center gap-1`}>
      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded font-semibold">
        🎯 Long Shot
      </span>
    </div>
  );
}
