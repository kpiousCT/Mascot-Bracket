'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Game, Team, Region } from '@/lib/types';

function BracketPageRegionalContent() {
  const searchParams = useSearchParams();
  const userNameFromUrl = searchParams.get('userName');
  const isReadOnly = searchParams.get('readonly') === 'true';

  const [userName, setUserName] = useState(userNameFromUrl || '');
  const [hasStarted, setHasStarted] = useState(!!userNameFromUrl);
  const [bracketId, setBracketId] = useState<string>('');
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [picks, setPicks] = useState<Map<string, string>>(new Map());
  const [masterBracket, setMasterBracket] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [savingGames, setSavingGames] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (hasStarted) {
      loadData();
    }
  }, [hasStarted]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [gamesRes, teamsRes, masterRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/teams'),
        fetch('/api/master'),
      ]);
      const [gamesData, teamsData, masterData] = await Promise.all([
        gamesRes.json(),
        teamsRes.json(),
        masterRes.json(),
      ]);
      setGames(gamesData);
      setTeams(teamsData);

      // Convert master bracket array to Map for easy lookup
      const masterMap = new Map<string, string>();
      masterData.forEach((entry: any) => {
        if (entry.winning_team_id) {
          masterMap.set(entry.game_id, entry.winning_team_id);
        }
      });
      setMasterBracket(masterMap);

      if (userName) {
        console.log('[Overview] Checking for existing bracket:', userName);
        const bracketRes = await fetch(`/api/brackets?userName=${encodeURIComponent(userName)}`);
        if (bracketRes.ok) {
          const bracketData = await bracketRes.json();
          console.log('[Overview] Found existing bracket:', bracketData.id);
          setBracketId(bracketData.id);
          setIsLocked(bracketData.is_locked || false);
          if (bracketData.picks) {
            const picksMap = new Map<string, string>(
              bracketData.picks.map((p: any) => [p.game_id, p.selected_team_id] as [string, string])
            );
            setPicks(picksMap);
          }
        } else {
          // Create new bracket if it doesn't exist
          console.log('[Overview] Creating new bracket for:', userName);
          const createRes = await fetch('/api/brackets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName }),
          });

          if (!createRes.ok) {
            const errorData = await createRes.json();
            console.error('[Overview] Failed to create bracket:', errorData);
            if (createRes.status === 409) {
              alert(errorData.error || 'This name is already taken. Please go back and choose a different name.');
              return;
            }
            throw new Error('Failed to create bracket');
          }

          const newBracket = await createRes.json();
          console.log('[Overview] Created bracket:', newBracket.id);
          setBracketId(newBracket.id);
        }
      } else {
        console.log('[Overview] No userName provided');
      }
    } catch (error) {
      console.error('[Overview] Error loading data:', error);
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

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          alert(errorData.error || 'This name is already taken. Please choose a different name.');
          setUserName('');
          return;
        }
        throw new Error('Failed to create bracket');
      }

      const data = await response.json();
      setBracketId(data.id);
      setHasStarted(true);
    } catch (err) {
      alert('Failed to create bracket');
    }
  };

  const selectWinner = async (gameId: string, teamId: string) => {
    // Prevent duplicate saves for the same game
    if (savingGames.has(gameId) || isLocked) return;

    console.log('[Overview] Team selected:', { gameId, teamId });

    // Mark this game as being saved
    setSavingGames(prev => new Set(prev).add(gameId));

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

    // Auto-save immediately after pick
    if (bracketId) {
      try {
        const picksArray = Array.from(newPicks.entries()).map(([game_id, selected_team_id]) => ({
          game_id,
          selected_team_id,
        }));
        console.log('[Overview] Saving picks:', picksArray);

        const response = await fetch(`/api/brackets/${bracketId}/picks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ picks: picksArray }),
        });

        const data = await response.json();
        console.log('[Overview] Save response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save pick');
        }
      } catch (error) {
        console.error('[Overview] Error auto-saving pick:', error);
        alert('Failed to save your pick. Please try again.');
        // Revert the pick on error
        setPicks(picks);
      } finally {
        // Remove from saving set
        setSavingGames(prev => {
          const newSet = new Set(prev);
          newSet.delete(gameId);
          return newSet;
        });
      }
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
  const [activeTab, setActiveTab] = useState<Region | 'Final Four'>('East');

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
            <Link href="/leaderboard" className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Leaderboard</Link>
          </div>
        </div>
      </div>

      {/* Region Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {regions.map(region => (
              <button
                key={region}
                onClick={() => setActiveTab(region)}
                className={`flex-1 px-6 py-4 font-semibold text-sm md:text-base transition-colors whitespace-nowrap ${
                  activeTab === region
                    ? 'bg-blue-600 text-white border-b-4 border-blue-800'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {region}
              </button>
            ))}
            <button
              onClick={() => setActiveTab('Final Four')}
              className={`flex-1 px-6 py-4 font-semibold text-sm md:text-base transition-colors whitespace-nowrap ${
                activeTab === 'Final Four'
                  ? 'bg-blue-600 text-white border-b-4 border-blue-800'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏆 Final Four
            </button>
          </div>
        </div>
      </div>

      {/* Bracket View */}
      {activeTab !== 'Final Four' ? (
        <RegionalBracket
          region={activeTab as Region}
          games={gamesWithDerivedTeams.filter(g => g.region === activeTab)}
          teams={teams}
          picks={picks}
          masterBracket={masterBracket}
          onSelectWinner={selectWinner}
          getTeamById={getTeamById}
          isReadOnly={isReadOnly || isLocked}
        />
      ) : (
        <FinalGames
          games={gamesWithDerivedTeams}
          teams={teams}
          picks={picks}
          masterBracket={masterBracket}
          onSelectWinner={selectWinner}
          getTeamById={getTeamById}
          isReadOnly={isReadOnly || isLocked}
        />
      )}
    </div>
  );
}

function RegionalBracket({ region, games, teams, picks, masterBracket, onSelectWinner, getTeamById, isReadOnly }: any) {
  const rounds = [
    { key: 'round_64', name: 'Round of 64' },
    { key: 'round_32', name: 'Round of 32' },
    { key: 'sweet_16', name: 'Sweet 16' },
    { key: 'elite_8', name: 'Elite 8' },
  ];

  return (
    <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-4 md:p-6 overflow-x-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">{region} Region</h2>

      {/* Traditional Bracket Layout */}
      <div className="flex gap-4 md:gap-8 min-w-[1000px]">
        {rounds.map((round, roundIndex) => {
          const roundGames = games.filter((g: any) => g.round === round.key);
          if (roundGames.length === 0) return null;

          // Calculate spacing multiplier for bracket effect
          const spacingMultiplier = Math.pow(2, roundIndex);

          return (
            <div key={round.key} className="flex-1 flex flex-col">
              <h3 className="text-xs md:text-sm font-bold text-gray-600 mb-3 text-center">
                {round.name}
              </h3>
              <div className="flex flex-col justify-around flex-1 gap-1" style={{ gap: `${spacingMultiplier * 8}px` }}>
                {roundGames.map((game: any) => (
                  <div key={game.id} className="relative">
                    <GameCard
                      game={game}
                      picks={picks}
                      masterBracket={masterBracket}
                      onSelectWinner={onSelectWinner}
                      getTeamById={getTeamById}
                      isReadOnly={isReadOnly}
                    />
                    {/* Connector line to next round */}
                    {roundIndex < rounds.length - 1 && (
                      <div className="absolute top-1/2 -right-4 md:-right-8 w-4 md:w-8 h-0.5 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinalGames({ games, teams, picks, masterBracket, onSelectWinner, getTeamById, isReadOnly }: any) {
  const finalFourGames = games.filter((g: any) => g.round === 'final_4');
  const championship = games.find((g: any) => g.round === 'championship');

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Final Four & Championship</h2>

        {/* Bracket-style layout for Final Four */}
        <div className="flex gap-4 md:gap-8 items-center justify-center min-w-[800px]">
          {/* Final Four Games */}
          <div className="flex flex-col gap-12">
            <h3 className="text-xs md:text-sm font-bold text-gray-600 mb-3 text-center">Final Four</h3>
            {finalFourGames.map((game: any, index: number) => (
              <div key={game.id} className="relative">
                <GameCard
                  game={game}
                  picks={picks}
                  masterBracket={masterBracket}
                  onSelectWinner={onSelectWinner}
                  getTeamById={getTeamById}
                  isReadOnly={isReadOnly}
                />
                {/* Connector line */}
                <div className="absolute top-1/2 -right-4 md:-right-8 w-4 md:w-8 h-0.5 bg-gray-300"></div>
              </div>
            ))}
          </div>

          {/* Championship */}
          {championship && (
            <div className="flex flex-col justify-center">
              <h3 className="text-xs md:text-sm font-bold text-gray-600 mb-3 text-center">🏆 Championship</h3>
              <GameCard
                game={championship}
                picks={picks}
                masterBracket={masterBracket}
                onSelectWinner={onSelectWinner}
                getTeamById={getTeamById}
                isReadOnly={isReadOnly}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BracketPageRegional() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BracketPageRegionalContent />
    </Suspense>
  );
}

function GameCard({ game, picks, masterBracket, onSelectWinner, getTeamById, isReadOnly }: any) {
  const team1 = getTeamById(game.derivedTeam1 || game.team1_id);
  const team2 = getTeamById(game.derivedTeam2 || game.team2_id);
  const selectedTeamId = picks.get(game.id);
  const actualWinnerId = masterBracket.get(game.id);

  if (!team1 || !team2) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-400 text-xs md:text-sm min-h-[100px] flex items-center justify-center">
        Waiting for<br/>previous round...
      </div>
    );
  }

  return (
    <div className="border-2 border-gray-300 rounded-lg p-2 bg-white hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <TeamButton
          team={team1}
          isSelected={selectedTeamId === team1.id}
          onSelect={() => onSelectWinner(game.id, team1.id)}
          isReadOnly={isReadOnly}
          actualWinnerId={actualWinnerId}
          masterBracket={masterBracket}
          round={game.round}
        />
        <TeamButton
          team={team2}
          isSelected={selectedTeamId === team2.id}
          onSelect={() => onSelectWinner(game.id, team2.id)}
          isReadOnly={isReadOnly}
          actualWinnerId={actualWinnerId}
          masterBracket={masterBracket}
          round={game.round}
        />
      </div>
    </div>
  );
}

function TeamButton({ team, isSelected, onSelect, isReadOnly, actualWinnerId, masterBracket, round }: any) {
  // Determine if this team was the actual winner
  const isActualWinner = actualWinnerId && actualWinnerId === team.id;
  // Determine if user's pick was correct (selected this team and it was the actual winner)
  const isCorrectPick = isSelected && isActualWinner;
  // Determine if user's pick was incorrect (selected this team but it wasn't the actual winner, and game is decided)
  const isIncorrectPick = isSelected && actualWinnerId && !isActualWinner;

  // Check if team has been eliminated in a PREVIOUS round
  // Only strikethrough teams that appear in future rounds after losing
  // Don't strikethrough teams in the round they actually lost
  const isEliminated = useMemo(() => {
    // If this game has been decided, don't strikethrough (show X or checkmark instead)
    if (actualWinnerId) {
      return false;
    }

    // Round of 64 is the starting round - no one is eliminated yet
    if (round === 'round_64' || round === 'first_four') {
      return false;
    }

    // This game hasn't been decided yet - check if this team was eliminated earlier
    if (!masterBracket || masterBracket.size === 0) {
      return false; // No games completed yet, no one eliminated
    }

    // Build a set of all teams that have won at least one game
    const teamsWithWins = new Set<string>();
    for (const winnerId of masterBracket.values()) {
      if (winnerId) {
        teamsWithWins.add(winnerId);
      }
    }

    // In later rounds, if team hasn't won any games, they're here from user picks but eliminated
    return !teamsWithWins.has(team.id);
  }, [actualWinnerId, masterBracket, team.id, round]);

  return (
    <button
      onClick={isReadOnly ? undefined : onSelect}
      disabled={isReadOnly}
      className={`group relative w-full p-2 rounded-lg border-2 flex items-center gap-2 transition-colors ${
        isCorrectPick
          ? 'border-green-600 bg-green-50'
          : isIncorrectPick
            ? 'border-red-600 bg-red-50'
            : isSelected
              ? 'border-blue-600 bg-blue-50'
              : isReadOnly
                ? 'border-gray-300 cursor-default'
                : 'border-gray-300 hover:border-blue-400 cursor-pointer'
      }`}
    >
      <div className={`relative w-10 h-10 bg-gray-100 rounded flex-shrink-0 ${isEliminated ? 'opacity-50' : ''}`}>
        <Image src={team.mascot_image_url} alt={team.mascot_name} fill className="object-contain p-1" onError={(e: any) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.mascot_name)}&size=128`; }} />
      </div>
      <div className="flex-1 text-left text-xs md:text-sm">
        <div className={`font-bold leading-tight ${isEliminated ? 'line-through opacity-50' : ''}`}>
          {team.name} {team.mascot_name}
        </div>
        <div className={`text-xs text-gray-500 ${isEliminated ? 'line-through opacity-50' : ''}`}>
          Seed #{team.seed}
        </div>
      </div>
      {isCorrectPick && <div className="text-green-600 text-lg font-bold">✓</div>}
      {isIncorrectPick && <div className="text-red-600 text-lg font-bold">✗</div>}
      {isSelected && !actualWinnerId && <div className="text-blue-600 text-lg">✓</div>}
    </button>
  );
}
