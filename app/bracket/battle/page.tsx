'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Game, Team } from '@/lib/types';
import { BattleMascotCard } from '@/components/bracket/BattleMascotCard';
import { GameProgressBar } from '@/components/bracket/GameProgressBar';
import { NavigationControls } from '@/components/bracket/NavigationControls';
import Link from 'next/link';

function BattleModePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = searchParams.get('userName');

  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [games, setGames] = useState<Game[]>([]);
  const [picks, setPicks] = useState<Map<string, string>>(new Map());
  const [bracketId, setBracketId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Calculate derived teams for future rounds based on user picks
  const gamesWithDerivedTeams = useMemo(() => {
    // Create a map of all teams from the games
    const allTeams = new Map<string, Team>();
    games.forEach(game => {
      if (game.team1) allTeams.set(game.team1.id, game.team1 as Team);
      if (game.team2) allTeams.set(game.team2.id, game.team2 as Team);
    });

    return games.map(game => {
      let derivedTeam1 = game.team1;
      let derivedTeam2 = game.team2;

      // Find games that feed into this one
      const feedingGames = games.filter(g => g.next_game_id === game.id);

      if (feedingGames.length === 2) {
        const [game1, game2] = feedingGames;
        const pick1 = picks.get(game1.id);
        const pick2 = picks.get(game2.id);

        // Use picked teams if available
        if (pick1) derivedTeam1 = allTeams.get(pick1) || game.team1;
        if (pick2) derivedTeam2 = allTeams.get(pick2) || game.team2;
      }

      return { ...game, team1: derivedTeam1, team2: derivedTeam2 };
    });
  }, [games, picks]);

  // Load data on mount
  useEffect(() => {
    if (!userName) {
      router.push('/bracket');
      return;
    }
    loadData();
  }, [userName]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentGameIndex > 0) {
        setCurrentGameIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentGameIndex < gamesWithDerivedTeams.length - 1) {
        setCurrentGameIndex(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGameIndex, gamesWithDerivedTeams.length]);

  // Auto-save is now handled immediately after each pick in handleMascotSelect

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Fetch games (teams are already joined in the query)
      const gamesRes = await fetch('/api/games');
      const gamesData = await gamesRes.json();
      setGames(gamesData);

      // Load or create bracket
      if (userName) {
        const bracketRes = await fetch(`/api/brackets?userName=${encodeURIComponent(userName)}`);

        if (bracketRes.ok) {
          const bracketData = await bracketRes.json();
          setBracketId(bracketData.id);
          setIsLocked(bracketData.is_locked || false);

          if (bracketData.picks) {
            const picksMap = new Map<string, string>(
              bracketData.picks.map((p: any) => [p.game_id, p.selected_team_id] as [string, string])
            );
            setPicks(picksMap);
          }
        } else {
          // Create new bracket
          const createRes = await fetch('/api/brackets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName }),
          });

          if (!createRes.ok) {
            const errorData = await createRes.json();
            if (createRes.status === 409) {
              alert(errorData.error || 'This name is already taken. Please go back and choose a different name.');
              router.push('/bracket');
              return;
            }
            throw new Error('Failed to create bracket');
          }

          const newBracket = await createRes.json();
          setBracketId(newBracket.id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bracketId || picks.size === 0) return;

    try {
      setIsSaving(true);
      const picksArray = Array.from(picks.entries()).map(([game_id, selected_team_id]) => ({
        game_id,
        selected_team_id,
      }));

      await fetch(`/api/brackets/${bracketId}/picks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ picks: picksArray }),
      });
    } catch (error) {
      console.error('Error saving picks:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMascotSelect = async (teamId: string) => {
    if (!currentGame || isLocked) return;

    console.log('[Battle] Team selected:', { gameId: currentGame.id, teamId, gameName: `${currentGame.team1?.name} vs ${currentGame.team2?.name}` });

    setPicks(prev => new Map(prev).set(currentGame.id, teamId));

    // Auto-save immediately after pick
    const picksArray = Array.from(picks.entries()).map(([game_id, selected_team_id]) => ({
      game_id,
      selected_team_id,
    }));
    // Add the current pick to the array
    picksArray.push({ game_id: currentGame.id, selected_team_id: teamId });

    console.log('[Battle] Saving picks:', picksArray);

    fetch(`/api/brackets/${bracketId}/picks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ picks: picksArray }),
    })
      .then(res => res.json())
      .then(data => console.log('[Battle] Save response:', data))
      .catch(error => console.error('[Battle] Error auto-saving pick:', error));

    // Show confetti effect
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 500);

    // Auto-advance after selection
    setTimeout(async () => {
      if (currentGameIndex < gamesWithDerivedTeams.length - 1) {
        setCurrentGameIndex(prev => prev + 1);
      } else {
        // All games complete! Navigate to overview
        setTimeout(() => {
          router.push(`/bracket/overview?userName=${encodeURIComponent(userName || '')}`);
        }, 500);
      }
    }, 800);
  };

  const handlePrevious = () => {
    if (currentGameIndex > 0) {
      setCurrentGameIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentGameIndex < gamesWithDerivedTeams.length - 1) {
      setCurrentGameIndex(prev => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading your bracket...</p>
        </div>
      </div>
    );
  }

  if (!userName) {
    return null;
  }

  const currentGame = gamesWithDerivedTeams[currentGameIndex];

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">No games available</p>
          <Link href="/bracket" className="text-blue-600 hover:underline mt-4 block">
            Go back
          </Link>
        </div>
      </div>
    );
  }

  // Use the derived team data (includes picks from previous rounds)
  const team1 = currentGame.team1 as Team | undefined;
  const team2 = currentGame.team2 as Team | undefined;
  const selectedTeamId = picks.get(currentGame.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-blue-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">
            🏀 Mascot Madness
          </h1>
          <p className="text-base md:text-lg text-gray-600">{userName}'s Bracket</p>
        </div>

        {/* Progress Bar */}
        <GameProgressBar
          currentGame={currentGameIndex + 1}
          totalGames={gamesWithDerivedTeams.length}
          roundName={currentGame.round}
          hasCurrentGamePick={!!selectedTeamId}
        />

        {/* Main Battle Arena */}
        {team1 && team2 ? (
          <div className="relative">
            {/* Confetti effect overlay */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                <div className="text-6xl animate-bounce">
                  🎉✨🎊
                </div>
              </div>
            )}

            {isLocked && (
              <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
                <span className="text-red-700 font-semibold">
                  🔒 This bracket is locked and cannot be edited
                </span>
              </div>
            )}

            <div className="relative grid grid-cols-2 gap-2 md:gap-6 items-stretch max-w-5xl mx-auto">
              {/* Team 1 */}
              <BattleMascotCard
                team={team1}
                isSelected={selectedTeamId === team1.id}
                onSelect={() => handleMascotSelect(team1.id)}
                disabled={isLocked}
              />

              {/* VS Badge - Always Centered */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                  {/* Badge */}
                  <div className="relative bg-gradient-to-br from-white to-gray-100 rounded-full p-2 md:p-4 shadow-2xl ring-3 md:ring-4 ring-purple-500 ring-offset-1 md:ring-offset-2">
                    <span className="text-xl md:text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      VS
                    </span>
                  </div>
                </div>
              </div>

              {/* Team 2 */}
              <BattleMascotCard
                team={team2}
                isSelected={selectedTeamId === team2.id}
                onSelect={() => handleMascotSelect(team2.id)}
                disabled={isLocked}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <p className="text-xl text-gray-600">Waiting for teams from previous round...</p>
            <p className="text-sm text-gray-500 mt-2">Complete earlier games to unlock this matchup</p>
          </div>
        )}

        {/* Navigation Controls */}
        <NavigationControls
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={currentGameIndex > 0}
          canGoNext={currentGameIndex < gamesWithDerivedTeams.length - 1}
          userName={userName}
        />
      </div>
    </div>
  );
}

export default function BattleModePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <BattleModePageContent />
    </Suspense>
  );
}
