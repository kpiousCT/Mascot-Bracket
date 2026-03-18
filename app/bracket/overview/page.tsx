'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Game, Team, Region } from '@/lib/types';

export default function BracketPageRegional() {
  const searchParams = useSearchParams();
  const userNameFromUrl = searchParams.get('userName');
  const isReadOnly = searchParams.get('readonly') === 'true';

  const [userName, setUserName] = useState(userNameFromUrl || '');
  const [hasStarted, setHasStarted] = useState(!!userNameFromUrl);
  const [bracketId, setBracketId] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    if (hasStarted) {
      loadData();
    }
  }, [hasStarted]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gamesRes, teamsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/teams'),
      ]);
      const [gamesData, teamsData] = await Promise.all([
        gamesRes.json(),
        teamsRes.json(),
      ]);
      setGames(gamesData);
      setTeams(teamsData);

      if (userName) {
        const bracketRes = await fetch(`/api/brackets?userName=${encodeURIComponent(userName)}`);
        if (bracketRes.ok) {
          const bracketData = await bracketRes.json();
          setBracketId(bracketData.id);
          setIsLocked(bracketData.is_locked || false);
          if (bracketData.picks) {
            const picksMap = new Map(bracketData.picks.map((p: any) => [p.game_id, p.selected_team_id]));
            setPicks(picksMap);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleStart = async () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }
    try {
      const response = await fetch('/api/brackets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: userName.trim() }),
      });
      const data = await response.json();
      setBracketId(data.id);
      setHasStarted(true);
    } catch (err) {
      alert('Failed to create bracket');
    }
  };

  const selectWinner = (gameId: string, teamId: string) => {
    const newPicks = new Map(picks);
    newPicks.set(gameId, teamId);

    // Auto-advance winner to next round
    const game = games.find(g => g.id === gameId);
    if (game?.next_game_id) {
      const nextGame = games.find(g => g.id === game.next_game_id);
      if (nextGame) {
        // Don't overwrite if user already picked for next round
        if (!newPicks.has(nextGame.id)) {
          // This will be handled by the derived teams logic
        }
      }
    }

    setPicks(newPicks);
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const picksArray = Array.from(picks.entries()).map(([game_id, selected_team_id]) => ({
        game_id,
        selected_team_id,
      }));
      await fetch(`/api/brackets/${bracketId}/picks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks: picksArray }),
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      setSaveStatus('idle');
      alert('Failed to save bracket');
    }
  };

  // Calculate derived teams for future rounds
  const gamesWithDerivedTeams = useMemo(() => {
    return games.map(game => {
      let derivedTeam1 = game.team1_id;
      let derivedTeam2 = game.team2_id;

      // Find games that feed into this one
      const feedingGames = games.filter(g => g.next_game_id === game.id);

      if (feedingGames.length === 2) {
        const [game1, game2] = feedingGames;
        const pick1 = picks.get(game1.id);
        const pick2 = picks.get(game2.id);

        if (pick1) derivedTeam1 = pick1;
        if (pick2) derivedTeam2 = pick2;
      }

      return { ...game, derivedTeam1, derivedTeam2 };
    });
  }, [games, picks]);

  const regions: Region[] = ['East', 'West', 'South', 'Midwest'];

  const getTeamById = (id: string | null) => {
    if (!id) return null;
    return teams.find(t => t.id === id);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Create Your Bracket</h1>
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
          />
          <button onClick={handleStart} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Start Picking!
          </button>
          <Link href="/" className="block text-center mt-4 text-gray-600 hover:text-gray-800">← Back</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completionPercentage = games.length > 0 ? Math.round((picks.size / games.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-900">{userName}'s Bracket</h1>
              {isReadOnly && (
                <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                  👁️ View Only
                </span>
              )}
              {isLocked && !isReadOnly && (
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                  🔒 Locked
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Complete: {completionPercentage}%
              {isLocked && !isReadOnly && ' • Bracket is locked, no edits allowed'}
            </p>
          </div>
          <div className="flex gap-3">
            {!isReadOnly && !isLocked && (
              <button onClick={handleSave} className={`px-6 py-2 rounded-lg font-semibold ${saveStatus === 'saved' ? 'bg-green-600' : 'bg-blue-600'} text-white`}>
                {saveStatus === 'saved' ? '✓ Saved!' : 'Save'}
              </button>
            )}
            <Link href="/leaderboard" className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Leaderboard</Link>
          </div>
        </div>
      </div>

      {/* Regional Brackets */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regions.map(region => (
          <RegionalBracket
            key={region}
            region={region}
            games={gamesWithDerivedTeams.filter(g => g.region === region)}
            teams={teams}
            picks={picks}
            onSelectWinner={selectWinner}
            getTeamById={getTeamById}
            isReadOnly={isReadOnly || isLocked}
          />
        ))}
      </div>

      {/* Final Four & Championship */}
      <FinalGames
        games={gamesWithDerivedTeams}
        teams={teams}
        picks={picks}
        onSelectWinner={selectWinner}
        getTeamById={getTeamById}
        isReadOnly={isReadOnly || isLocked}
      />
    </div>
  );
}

function RegionalBracket({ region, games, teams, picks, onSelectWinner, getTeamById, isReadOnly }: any) {
  const rounds = ['round_64', 'round_32', 'sweet_16', 'elite_8'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">{region} Region</h2>
      <div className="space-y-6">
        {rounds.map(round => {
          const roundGames = games.filter((g: any) => g.round === round);
          if (roundGames.length === 0) return null;

          return (
            <div key={round}>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                {round === 'round_64' ? 'Round of 64' : round === 'round_32' ? 'Round of 32' : round === 'sweet_16' ? 'Sweet 16' : 'Elite 8'}
              </h3>
              <div className="space-y-2">
                {roundGames.map((game: any) => (
                  <GameCard key={game.id} game={game} picks={picks} onSelectWinner={onSelectWinner} getTeamById={getTeamById} isReadOnly={isReadOnly} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinalGames({ games, teams, picks, onSelectWinner, getTeamById, isReadOnly }: any) {
  const finalFourGames = games.filter((g: any) => g.round === 'final_4');
  const championship = games.find((g: any) => g.round === 'championship');

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Final Four & Championship</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {finalFourGames.map((game: any) => (
            <GameCard key={game.id} game={game} picks={picks} onSelectWinner={onSelectWinner} getTeamById={getTeamById} isReadOnly={isReadOnly} />
          ))}
        </div>
        {championship && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Championship</h3>
            <GameCard game={championship} picks={picks} onSelectWinner={onSelectWinner} getTeamById={getTeamById} isReadOnly={isReadOnly} />
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, picks, onSelectWinner, getTeamById, isReadOnly }: any) {
  const team1 = getTeamById(game.derivedTeam1 || game.team1_id);
  const team2 = getTeamById(game.derivedTeam2 || game.team2_id);
  const selectedTeamId = picks.get(game.id);

  if (!team1 || !team2) {
    return <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-400 text-sm">Waiting for previous round...</div>;
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg p-3">
      <div className="space-y-2">
        <TeamButton team={team1} isSelected={selectedTeamId === team1.id} onSelect={() => onSelectWinner(game.id, team1.id)} isReadOnly={isReadOnly} />
        <div className="text-center text-xs text-gray-400">VS</div>
        <TeamButton team={team2} isSelected={selectedTeamId === team2.id} onSelect={() => onSelectWinner(game.id, team2.id)} isReadOnly={isReadOnly} />
      </div>
    </div>
  );
}

function TeamButton({ team, isSelected, onSelect, isReadOnly }: any) {
  return (
    <button
      onClick={isReadOnly ? undefined : onSelect}
      disabled={isReadOnly}
      className={`group relative w-full p-2 rounded-lg border-2 flex items-center gap-2 ${
        isSelected
          ? 'border-blue-600 bg-blue-50'
          : isReadOnly
            ? 'border-gray-300 cursor-default'
            : 'border-gray-300 hover:border-blue-400 cursor-pointer'
      }`}
    >
      <div className="relative w-10 h-10 bg-gray-100 rounded flex-shrink-0">
        <Image src={team.mascot_image_url} alt={team.mascot_name} fill className="object-contain p-1" onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.mascot_name)}&size=128`; }} />
      </div>
      <div className="flex-1 text-left text-sm">
        <div className="font-bold">{team.mascot_name}</div>
        <div className="text-xs text-gray-500">#{team.seed}</div>
      </div>
      {isSelected && <div className="text-blue-600">✓</div>}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">{team.name}</div>
    </button>
  );
}
