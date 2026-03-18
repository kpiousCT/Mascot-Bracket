'use client';

import { useEffect, useState } from 'react';
import type { Game, Team, BracketPick } from '@/lib/types';

interface UseBracketOptions {
  bracketId?: string;
  userName?: string;
}

export function useBracket(options: UseBracketOptions = {}) {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bracketId, setBracketId] = useState<string | undefined>(
    options.bracketId
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch games and teams in parallel
        const [gamesRes, teamsRes] = await Promise.all([
          fetch('/api/games'),
          fetch('/api/teams'),
        ]);

        if (!gamesRes.ok || !teamsRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const gamesData = await gamesRes.json();
        const teamsData = await teamsRes.json();

        setGames(gamesData);
        setTeams(teamsData);

        // If userName provided, try to load existing bracket
        if (options.userName) {
          const bracketRes = await fetch(
            `/api/brackets?userName=${encodeURIComponent(options.userName)}`
          );

          if (bracketRes.ok) {
            const bracketData = await bracketRes.json();
            setBracketId(bracketData.id);

            // Load existing picks
            if (bracketData.picks && Array.isArray(bracketData.picks)) {
              const picksMap = new Map(
                bracketData.picks.map((pick: BracketPick) => [
                  pick.game_id,
                  pick.selected_team_id,
                ])
              );
              setPicks(picksMap);
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching bracket data:', err);
        setError('Failed to load bracket');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [options.userName, options.bracketId]);

  const selectWinner = (gameId: string, teamId: string) => {
    setPicks((prev) => new Map(prev).set(gameId, teamId));
  };

  const saveBracket = async () => {
    if (!bracketId) {
      throw new Error('No bracket ID');
    }

    const picksArray = Array.from(picks.entries()).map(
      ([game_id, selected_team_id]) => ({
        game_id,
        selected_team_id,
      })
    );

    const response = await fetch(`/api/brackets/${bracketId}/picks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ picks: picksArray }),
    });

    if (!response.ok) {
      throw new Error('Failed to save bracket');
    }

    return response.json();
  };

  const createBracket = async (userName: string) => {
    const response = await fetch('/api/brackets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    });

    if (!response.ok) {
      throw new Error('Failed to create bracket');
    }

    const data = await response.json();
    setBracketId(data.id);
    return data;
  };

  const completionPercentage =
    games.length > 0 ? Math.round((picks.size / games.length) * 100) : 0;

  return {
    games,
    teams,
    picks,
    bracketId,
    isLoading,
    error,
    selectWinner,
    saveBracket,
    createBracket,
    completionPercentage,
  };
}
