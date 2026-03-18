'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard, subscribeToLeaderboard } from '@/lib/db/client';
import type { LeaderboardScore } from '@/lib/types';

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        const data = await getLeaderboard();
        setLeaderboard(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();

    // Set up real-time subscription
    const channel = subscribeToLeaderboard((payload) => {
      console.log('Leaderboard update:', payload);
      // Refetch on any change
      fetchLeaderboard();
    });

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  return { leaderboard, isLoading, error };
}
