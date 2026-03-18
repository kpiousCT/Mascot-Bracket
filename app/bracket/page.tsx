'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BracketEntryPage() {
  const [userName, setUserName] = useState('');
  const [hasEnteredName, setHasEnteredName] = useState(false);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setHasEnteredName(true);
    } else {
      alert('Please enter your name');
    }
  };

  // Name entry screen
  if (!hasEnteredName) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-4 text-center">
            Create Your Bracket
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            Enter your name to get started. Pick winners based on mascots!
          </p>

          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Picking!
            </button>
          </form>

          <Link
            href="/"
            className="block text-center mt-4 text-gray-600 hover:text-gray-800"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Mode selection screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Hi, {userName}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Choose how you'd like to make your picks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mascot Battle */}
          <Link
            href={`/bracket/battle?userName=${encodeURIComponent(userName)}`}
            className="group"
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
              <div className="text-6xl mb-4">🏀</div>
              <h2 className="text-3xl font-bold mb-3">Mascot Battle</h2>
              <p className="text-lg mb-4 text-purple-100">
                One game at a time with huge mascots!
              </p>
              <div className="mt-6 inline-block px-6 py-2 bg-white text-purple-600 rounded-full font-semibold group-hover:bg-purple-50">
                Start Mascot Battle →
              </div>
            </div>
          </Link>

          {/* Overview Mode */}
          <Link
            href={`/bracket/overview?userName=${encodeURIComponent(userName)}`}
            className="group"
          >
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-8 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold mb-3">Overview Mode</h2>
              <p className="text-lg mb-4 text-blue-100">
                See all games at once, traditional bracket view
              </p>
              <div className="mt-6 inline-block px-6 py-2 bg-white text-blue-600 rounded-full font-semibold group-hover:bg-blue-50">
                Start Overview Mode →
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center">
          <button
            onClick={() => setHasEnteredName(false)}
            className="text-gray-600 hover:text-gray-800 underline"
          >
            Change Name
          </button>
        </div>
      </div>
    </div>
  );
}
