import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-6xl font-bold text-blue-900">
          🏀 Mascot Madness
        </h1>
        <p className="text-xl text-gray-700">
          Welcome to the NCAA Tournament Bracket Challenge!
          <br />
          Pick your winners based on mascots, not teams.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href="/bracket"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Your Bracket
          </Link>
          <Link
            href="/leaderboard"
            className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Leaderboard
          </Link>
        </div>

        <div className="mt-12 text-sm text-gray-600">
          <p className="font-semibold mb-2">Scoring:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div>Round 1: <span className="font-bold">1 pt</span></div>
            <div>Round 2: <span className="font-bold">2 pts</span></div>
            <div>Sweet 16: <span className="font-bold">4 pts</span></div>
            <div>Elite 8: <span className="font-bold">8 pts</span></div>
            <div>Final 4: <span className="font-bold">16 pts</span></div>
            <div>Champion: <span className="font-bold">32 pts</span></div>
          </div>
        </div>
      </div>
    </main>
  );
}
