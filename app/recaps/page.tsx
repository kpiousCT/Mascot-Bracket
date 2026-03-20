'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DailyRecapCard } from '@/components/recap/DailyRecapCard';
import type { DailyRecap } from '@/lib/types';

export default function RecapsPage() {
  const [recaps, setRecaps] = useState<DailyRecap[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRecaps() {
      try {
        const response = await fetch('/api/recaps');
        if (!response.ok) throw new Error('Failed to load recaps');
        const data = await response.json();
        setRecaps(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    loadRecaps();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 rounded-lg shadow-lg p-8 text-center text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
              📅 Tournament Recaps
            </h1>
            <p className="text-gray-600 mt-1">
              Daily summaries of tournament action
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            ← Leaderboard
          </Link>
        </div>

        {/* Recaps List */}
        {recaps.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-xl text-gray-600 mb-4">
              No recaps generated yet.
            </p>
            <p className="text-sm text-gray-500">
              Recaps will appear here as the tournament progresses!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {recaps.map((recap) => (
              <DailyRecapCard key={recap.id} recap={recap} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
