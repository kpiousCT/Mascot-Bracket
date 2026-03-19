'use client';

import { useState, useEffect } from 'react';
import type { Game, Team, MasterBracketEntry, Region } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [masterBracket, setMasterBracket] = useState<MasterBracketEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [bracketsLocked, setBracketsLocked] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [brackets, setBrackets] = useState<any[]>([]);
  const [showBrackets, setShowBrackets] = useState(false);
  const [selectedBrackets, setSelectedBrackets] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [lastSync, setLastSync] = useState<{
    time: string;
    status: string;
    gamesUpdated: number;
  } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check localStorage for existing admin session on mount
  useEffect(() => {
    const storedPassword = localStorage.getItem('adminPassword');
    if (storedPassword) {
      setPassword(storedPassword);
      setAuthenticated(true);
    }
  }, []);

  const handleAuth = () => {
    if (password) {
      localStorage.setItem('adminPassword', password);
      setAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setAuthenticated(false);
    setPassword('');
  };

  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [gamesRes, teamsRes, masterRes, bracketsRes] = await Promise.all([
        fetch('/api/games'),
        fetch('/api/teams'),
        fetch('/api/master'),
        fetch('/api/brackets'),
      ]);

      if (gamesRes.ok) setGames(await gamesRes.json());
      if (teamsRes.ok) setTeams(await teamsRes.json());
      if (masterRes.ok) setMasterBracket(await masterRes.json());

      // Check if any brackets are locked
      if (bracketsRes.ok) {
        const bracketsData = await bracketsRes.json();
        setBrackets(bracketsData);
        const anyLocked = bracketsData.some((b: any) => b.is_locked);
        setBracketsLocked(anyLocked);
      }

      // Load last sync status
      await loadLastSync();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastSync = async () => {
    try {
      // Fetch the most recent sync log
      const response = await fetch('/api/sync-logs?limit=1');
      if (response.ok) {
        const logs = await response.json();
        if (logs && logs.length > 0) {
          const latest = logs[0];
          setLastSync({
            time: latest.sync_time,
            status: latest.status,
            gamesUpdated: latest.games_updated,
          });
        }
      }
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const handleManualSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    setUpdateStatus('Syncing results...');

    try {
      const response = await fetch('/api/sync-results');
      const result = await response.json();

      if (result.success) {
        setUpdateStatus(`✓ Synced! Updated ${result.gamesUpdated} game(s)`);
        await loadData(); // Reload to show new results
      } else {
        setUpdateStatus(`❌ Sync failed: ${result.error || 'Unknown error'}`);
      }

      setTimeout(() => setUpdateStatus(''), 3000);
    } catch (error) {
      console.error('Error triggering sync:', error);
      setUpdateStatus('❌ Sync failed');
      setTimeout(() => setUpdateStatus(''), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleBracketSelection = (bracketId: string) => {
    setSelectedBrackets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bracketId)) {
        newSet.delete(bracketId);
      } else {
        newSet.add(bracketId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedBrackets.size === brackets.length) {
      setSelectedBrackets(new Set());
    } else {
      setSelectedBrackets(new Set(brackets.map(b => b.id)));
    }
  };

  const deleteSelectedBrackets = async () => {
    if (selectedBrackets.size === 0) {
      alert('No brackets selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBrackets.size} bracket(s)? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    let successCount = 0;
    let errorCount = 0;

    for (const bracketId of selectedBrackets) {
      try {
        const response = await fetch(`/api/brackets/${bracketId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminPassword: password }),
        });

        if (response.ok) {
          successCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error('Error deleting bracket:', error);
        errorCount++;
      }
    }

    setIsDeleting(false);
    setSelectedBrackets(new Set());
    setUpdateStatus(`🗑️ Deleted ${successCount} bracket(s)${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
    setTimeout(() => setUpdateStatus(''), 3000);
    await loadData();
  };

  const deleteBracket = async (bracketId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete ${userName}'s bracket? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/brackets/${bracketId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          alert('Incorrect admin password');
          setAuthenticated(false);
          return;
        }
        throw new Error(errorData.error || 'Failed to delete bracket');
      }

      setUpdateStatus(`🗑️ Deleted ${userName}'s bracket`);
      setTimeout(() => setUpdateStatus(''), 2000);
      await loadData();
    } catch (error: any) {
      console.error('Error deleting bracket:', error);
      alert(error.message || 'Failed to delete bracket');
    }
  };

  const handleLockBrackets = async (locked: boolean) => {
    try {
      setLockLoading(true);
      const response = await fetch('/api/brackets/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: password,
          locked,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Incorrect admin password');
          setAuthenticated(false);
          return;
        }
        throw new Error('Failed to lock brackets');
      }

      setBracketsLocked(locked);
      setUpdateStatus(locked ? '🔒 All brackets locked!' : '🔓 All brackets unlocked!');
      setTimeout(() => setUpdateStatus(''), 2000);
    } catch (error) {
      console.error('Error locking brackets:', error);
      alert('Failed to lock brackets');
    } finally {
      setLockLoading(false);
    }
  };

  const updateGameResult = async (gameId: string, winningTeamId: string) => {
    try {
      setUpdateStatus('Updating...');
      const response = await fetch('/api/master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          winningTeamId,
          adminPassword: password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Incorrect admin password');
          setAuthenticated(false);
          return;
        }
        throw new Error('Failed to update');
      }

      setUpdateStatus('✓ Updated! Scores recalculated.');
      setTimeout(() => setUpdateStatus(''), 2000);
      await loadData();
    } catch (error) {
      console.error('Error updating game:', error);
      setUpdateStatus('❌ Error updating');
      setTimeout(() => setUpdateStatus(''), 2000);
    }
  };

  const getTeamById = (id: string | null) => {
    if (!id) return null;
    return teams.find((t) => t.id === id);
  };

  const getGameWinner = (gameId: string) => {
    const entry = masterBracket.find((e) => e.game_id === gameId);
    return entry?.winning_team_id || null;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">Admin Panel</h1>
          <p className="text-gray-600 mb-6 text-center">Enter admin password to update tournament results</p>
          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
          />
          <button onClick={handleAuth} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Access Admin Panel
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

  const regions: Region[] = ['East', 'West', 'South', 'Midwest'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">🔐 Admin Panel - Master Bracket</h1>
            <p className="text-sm text-gray-600">Select winners for completed games</p>
          </div>
          <div className="flex gap-3 items-center">
            {updateStatus && (
              <div className="px-4 py-2 bg-blue-50 rounded-lg text-blue-600 font-semibold">{updateStatus}</div>
            )}
            <button
              onClick={() => handleLockBrackets(!bracketsLocked)}
              disabled={lockLoading}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                bracketsLocked
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              } ${lockLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {lockLoading ? '...' : bracketsLocked ? '🔓 Unlock Brackets' : '🔒 Lock Brackets'}
            </button>
            <button
              onClick={() => setShowBrackets(!showBrackets)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            >
              📋 Brackets ({brackets.length})
            </button>
            <Link href="/admin/mascots" className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
              🎭 Mascots
            </Link>
            <Link href="/leaderboard" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Leaderboard
            </Link>
            <button onClick={handleLogout} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Sync Status Section */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-blue-900">🔄 Automatic Result Sync</h2>
              {lastSync ? (
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-sm text-gray-600">
                    Last sync:{' '}
                    <span className="font-semibold">
                      {new Date(lastSync.time).toLocaleString()}
                    </span>
                    {' '}({Math.round((Date.now() - new Date(lastSync.time).getTime()) / 60000)} min ago)
                  </p>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      lastSync.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : lastSync.status === 'partial'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {lastSync.status === 'success' && '✓ Success'}
                    {lastSync.status === 'partial' && '⚠ Partial'}
                    {lastSync.status === 'failed' && '✗ Failed'}
                  </span>
                  {lastSync.gamesUpdated > 0 && (
                    <span className="text-sm text-gray-600">
                      {lastSync.gamesUpdated} game(s) updated
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  No sync logs found. Daily cron will run automatically at midnight UTC.
                </p>
              )}
            </div>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className={`px-6 py-2 rounded-lg font-semibold ${
                isSyncing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {isSyncing ? '⏳ Syncing...' : '🔄 Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* Brackets Management Section */}
      {showBrackets && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-900">User Brackets ({brackets.length})</h2>
              {selectedBrackets.size > 0 && (
                <button
                  onClick={deleteSelectedBrackets}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Deleting...' : `🗑️ Delete Selected (${selectedBrackets.size})`}
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedBrackets.size === brackets.length && brackets.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">User Name</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Created</th>
                    <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brackets.map((bracket) => (
                    <tr key={bracket.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={selectedBrackets.has(bracket.id)}
                          onChange={() => toggleBracketSelection(bracket.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3 font-medium">{bracket.user_name}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          bracket.is_locked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {bracket.is_locked ? '🔒 Locked' : '🔓 Unlocked'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-sm text-gray-600">
                        {new Date(bracket.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteBracket(bracket.id, bracket.user_name)}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-semibold"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {brackets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No brackets created yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Regional Brackets */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {regions.map(region => (
          <AdminRegionalBracket
            key={region}
            region={region}
            games={games.filter(g => g.region === region)}
            teams={teams}
            masterBracket={masterBracket}
            onUpdateResult={updateGameResult}
            getTeamById={getTeamById}
            getGameWinner={getGameWinner}
          />
        ))}
      </div>

      {/* Final Four & Championship */}
      <AdminFinalGames
        games={games}
        teams={teams}
        masterBracket={masterBracket}
        onUpdateResult={updateGameResult}
        getTeamById={getTeamById}
        getGameWinner={getGameWinner}
      />
    </div>
  );
}

function AdminRegionalBracket({ region, games, teams, masterBracket, onUpdateResult, getTeamById, getGameWinner }: any) {
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
                  <AdminGameCard
                    key={game.id}
                    game={game}
                    onUpdateResult={onUpdateResult}
                    getTeamById={getTeamById}
                    getGameWinner={getGameWinner}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminFinalGames({ games, teams, masterBracket, onUpdateResult, getTeamById, getGameWinner }: any) {
  const finalFourGames = games.filter((g: any) => g.round === 'final_4');
  const championship = games.find((g: any) => g.round === 'championship');

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Final Four & Championship</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {finalFourGames.map((game: any) => (
            <AdminGameCard
              key={game.id}
              game={game}
              onUpdateResult={onUpdateResult}
              getTeamById={getTeamById}
              getGameWinner={getGameWinner}
            />
          ))}
        </div>
        {championship && (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Championship</h3>
            <AdminGameCard
              game={championship}
              onUpdateResult={onUpdateResult}
              getTeamById={getTeamById}
              getGameWinner={getGameWinner}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function AdminGameCard({ game, onUpdateResult, getTeamById, getGameWinner }: any) {
  const team1 = getTeamById(game.team1_id);
  const team2 = getTeamById(game.team2_id);
  const winningTeamId = getGameWinner(game.id);

  if (!team1 || !team2) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-400 text-sm">
        Waiting for previous round...
      </div>
    );
  }

  return (
    <div className={`border-2 rounded-lg p-3 ${winningTeamId ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-gray-600 font-semibold">Game {game.game_number}</div>
        {winningTeamId && <div className="text-xs text-green-600 font-semibold">✓ Complete</div>}
      </div>
      <div className="space-y-2">
        <AdminTeamButton team={team1} isWinner={winningTeamId === team1.id} onSelect={() => onUpdateResult(game.id, team1.id)} />
        <div className="text-center text-xs text-gray-400">VS</div>
        <AdminTeamButton team={team2} isWinner={winningTeamId === team2.id} onSelect={() => onUpdateResult(game.id, team2.id)} />
      </div>
    </div>
  );
}

function AdminTeamButton({ team, isWinner, onSelect }: any) {
  return (
    <button onClick={onSelect} className={`w-full p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${isWinner ? 'border-green-600 bg-green-100 shadow-lg' : 'border-gray-300 hover:border-green-400'}`}>
      <div className="relative w-10 h-10 bg-gray-100 rounded flex-shrink-0">
        <Image
          src={team.mascot_image_url}
          alt={team.mascot_name}
          fill
          className="object-contain p-1"
          onError={(e: any) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.mascot_name)}&size=128`;
          }}
        />
      </div>
      <div className="flex-1 text-left text-sm">
        <div className="font-bold">{team.name}</div>
        <div className="text-xs text-gray-500">{team.mascot_name} (#{team.seed})</div>
      </div>
      {isWinner && <div className="text-green-600 text-xl">✓</div>}
    </button>
  );
}
