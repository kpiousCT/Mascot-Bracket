'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Team } from '@/lib/types';

export default function AdminMascotsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ [key: string]: string }>({});
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editMascot, setEditMascot] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: string }>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  const handleAuth = () => {
    if (password) {
      setAuthenticated(true);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadTeams();
    }
  }, [authenticated]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (teamId: string, file: File) => {
    try {
      setUploadStatus(prev => ({ ...prev, [teamId]: 'Uploading...' }));

      const formData = new FormData();
      formData.append('file', file);
      formData.append('adminPassword', password);

      const response = await fetch(`/api/teams/${teamId}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Incorrect admin password');
          setAuthenticated(false);
          return;
        }
        throw new Error('Failed to upload');
      }

      setUploadStatus(prev => ({ ...prev, [teamId]: '✓ Uploaded!' }));
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, [teamId]: '' }));
      }, 2000);

      // Reload teams to show new image
      await loadTeams();
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus(prev => ({ ...prev, [teamId]: '❌ Failed' }));
      setTimeout(() => {
        setUploadStatus(prev => ({ ...prev, [teamId]: '' }));
      }, 2000);
    }
  };

  const startEditing = (team: Team) => {
    setEditingTeamId(team.id);
    setEditName(team.name);
    setEditMascot(team.mascot_name);
    setDuplicateWarning(null);
  };

  const cancelEditing = () => {
    setEditingTeamId(null);
    setEditName('');
    setEditMascot('');
    setDuplicateWarning(null);
  };

  const saveTeamEdit = async (teamId: string) => {
    try {
      setSaveStatus(prev => ({ ...prev, [teamId]: 'Saving...' }));
      setDuplicateWarning(null);

      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: password,
          name: editName,
          mascot_name: editMascot,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Incorrect admin password');
          setAuthenticated(false);
          return;
        }
        throw new Error('Failed to update team');
      }

      const result = await response.json();

      if (result.isDuplicate) {
        setDuplicateWarning(`⚠️ Warning: Another team already uses the name "${editName}"`);
      }

      setSaveStatus(prev => ({ ...prev, [teamId]: '✓ Saved!' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [teamId]: '' }));
        if (!result.isDuplicate) {
          setDuplicateWarning(null);
        }
      }, 2000);

      // Reload teams to show updated data
      await loadTeams();
      setEditingTeamId(null);
    } catch (error) {
      console.error('Error updating team:', error);
      setSaveStatus(prev => ({ ...prev, [teamId]: '❌ Failed' }));
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, [teamId]: '' }));
      }, 2000);
    }
  };

  // Authentication screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">
            Mascot Image Manager
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Enter admin password to manage mascot images
          </p>

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
          />

          <button
            onClick={handleAuth}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Access Image Manager
          </button>

          <Link href="/admin" className="block text-center mt-4 text-gray-600 hover:text-gray-800">
            ← Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Group teams by region
  const teamsByRegion = teams.reduce((acc, team) => {
    if (!acc[team.region]) {
      acc[team.region] = [];
    }
    acc[team.region].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-900">
                🎭 Mascot Image Manager
              </h1>
              <p className="text-gray-600 mt-1">Upload mascot images for each team</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300"
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-2">📝 Instructions</h2>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Choose File" to select a mascot image (PNG, JPG, or GIF)</li>
            <li>• Images will be saved to <code className="bg-blue-100 px-1 rounded">public/mascots/</code></li>
            <li>• Best size: 512x512px or larger, square images work best</li>
            <li>• Images will appear immediately after upload</li>
          </ul>
        </div>

        {/* Teams by Region */}
        {Object.entries(teamsByRegion).map(([region, regionTeams]) => (
          <div key={region} className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">{region} Region</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionTeams.map((team) => (
                <div key={team.id} className="border-2 border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    {/* Current Mascot Image */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={team.mascot_image_url}
                        alt={team.mascot_name}
                        fill
                        className="object-contain p-2"
                        onError={(e: any) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            team.mascot_name
                          )}&size=256&background=random`;
                        }}
                      />
                    </div>

                    {/* Team Info & Upload */}
                    <div className="flex-1">
                      {editingTeamId === team.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Team Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-bold"
                          />
                          <input
                            type="text"
                            value={editMascot}
                            onChange={(e) => setEditMascot(e.target.value)}
                            placeholder="Mascot Name"
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                          />
                          <p className="text-xs text-gray-500">
                            {team.region} Region • Seed #{team.seed} (not editable)
                          </p>
                          {duplicateWarning && editingTeamId === team.id && (
                            <p className="text-xs text-yellow-600 font-semibold">
                              {duplicateWarning}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveTeamEdit(team.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded text-sm font-semibold hover:bg-green-700"
                            >
                              {saveStatus[team.id] || 'Save'}
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded text-sm font-semibold hover:bg-gray-400"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-gray-900">{team.name}</h3>
                              <p className="text-sm text-gray-600">{team.mascot_name}</p>
                              <p className="text-xs text-gray-500">
                                {team.region} Region • Seed #{team.seed}
                              </p>
                            </div>
                            <button
                              onClick={() => startEditing(team)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold hover:bg-gray-200"
                            >
                              ✏️ Edit
                            </button>
                          </div>

                          <div className="mt-2">
                            <label className="inline-block">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(team.id, file);
                                  }
                                }}
                                className="hidden"
                              />
                              <span className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700">
                                Choose File
                              </span>
                            </label>

                            {uploadStatus[team.id] && (
                              <span className="ml-2 text-sm font-semibold text-blue-600">
                                {uploadStatus[team.id]}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
