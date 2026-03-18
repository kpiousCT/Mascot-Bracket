// School color configurations for NCAA teams
// Each school has gradient colors (from/to) and a ring color for borders

export interface SchoolColors {
  from: string;
  to: string;
  ring: string;
}

export const SCHOOL_COLORS: Record<string, SchoolColors> = {
  // East Region
  'Duke': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
  'Siena': { from: 'from-green-600', to: 'to-yellow-600', ring: 'ring-green-500' },
  'Ohio State': { from: 'from-red-700', to: 'to-gray-700', ring: 'ring-red-600' },
  'TCU': { from: 'from-purple-700', to: 'to-purple-900', ring: 'ring-purple-600' },
  "St. John's": { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Northern Iowa': { from: 'from-purple-700', to: 'to-yellow-600', ring: 'ring-purple-600' },
  'Kansas': { from: 'from-blue-600', to: 'to-red-600', ring: 'ring-blue-500' },
  'Cal Baptist': { from: 'from-blue-700', to: 'to-orange-600', ring: 'ring-blue-600' },
  'Louisville': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
  'South Florida': { from: 'from-green-700', to: 'to-yellow-600', ring: 'ring-green-600' },
  'Michigan State': { from: 'from-green-700', to: 'to-green-900', ring: 'ring-green-600' },
  'North Dakota State': { from: 'from-green-700', to: 'to-yellow-600', ring: 'ring-green-600' },
  'UCLA': { from: 'from-blue-500', to: 'to-yellow-500', ring: 'ring-blue-500' },
  'UCF': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
  'UConn': { from: 'from-blue-800', to: 'to-blue-950', ring: 'ring-blue-700' },
  'Furman': { from: 'from-purple-700', to: 'to-purple-900', ring: 'ring-purple-600' },

  // West Region
  'Arizona': { from: 'from-red-700', to: 'to-blue-900', ring: 'ring-red-600' },
  'LIU': { from: 'from-blue-700', to: 'to-yellow-600', ring: 'ring-blue-600' },
  'Villanova': { from: 'from-blue-600', to: 'to-blue-800', ring: 'ring-blue-600' },
  'Utah State': { from: 'from-blue-800', to: 'to-blue-950', ring: 'ring-blue-700' },
  'Wisconsin': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'High Point': { from: 'from-purple-700', to: 'to-purple-900', ring: 'ring-purple-600' },
  'Arkansas': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Hawaii': { from: 'from-green-700', to: 'to-green-900', ring: 'ring-green-600' },
  'BYU': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
  'Texas': { from: 'from-orange-600', to: 'to-orange-800', ring: 'ring-orange-500' },
  'NC State': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Gonzaga': { from: 'from-blue-800', to: 'to-red-700', ring: 'ring-blue-700' },
  'Kennesaw State': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
  'Miami': { from: 'from-orange-600', to: 'to-green-700', ring: 'ring-orange-500' },
  'Missouri': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-500' },
  'Purdue': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
  'Queens': { from: 'from-blue-700', to: 'to-yellow-600', ring: 'ring-blue-600' },

  // Midwest Region
  'Michigan': { from: 'from-blue-600', to: 'to-yellow-500', ring: 'ring-blue-500' },
  'UMBC': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
  'Howard': { from: 'from-blue-700', to: 'to-red-700', ring: 'ring-blue-600' },
  'Georgia': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
  'Saint Louis': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
  'Texas Tech': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
  'Akron': { from: 'from-blue-700', to: 'to-yellow-600', ring: 'ring-blue-600' },
  'Alabama': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Hofstra': { from: 'from-blue-700', to: 'to-yellow-600', ring: 'ring-blue-600' },
  'Tennessee': { from: 'from-orange-600', to: 'to-orange-800', ring: 'ring-orange-500' },
  'SMU': { from: 'from-red-700', to: 'to-blue-700', ring: 'ring-red-600' },
  'Miami (Ohio)': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Virginia': { from: 'from-orange-600', to: 'to-blue-800', ring: 'ring-orange-500' },
  'Wright State': { from: 'from-green-700', to: 'to-yellow-600', ring: 'ring-green-600' },
  'Kentucky': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },
  'Santa Clara': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Iowa State': { from: 'from-red-700', to: 'to-yellow-600', ring: 'ring-red-600' },
  'Tennessee State': { from: 'from-blue-700', to: 'to-blue-900', ring: 'ring-blue-600' },

  // South Region
  'Florida': { from: 'from-orange-600', to: 'to-blue-700', ring: 'ring-orange-500' },
  'Prairie View A&M': { from: 'from-purple-700', to: 'to-yellow-600', ring: 'ring-purple-600' },
  'Lehigh': { from: 'from-amber-700', to: 'to-amber-900', ring: 'ring-amber-600' },
  'Clemson': { from: 'from-orange-600', to: 'to-purple-700', ring: 'ring-orange-500' },
  'Iowa': { from: 'from-yellow-500', to: 'to-gray-800', ring: 'ring-yellow-500' },
  'Vanderbilt': { from: 'from-yellow-600', to: 'to-gray-800', ring: 'ring-yellow-600' },
  'McNeese': { from: 'from-blue-700', to: 'to-yellow-600', ring: 'ring-blue-600' },
  'Nebraska': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Troy': { from: 'from-red-700', to: 'to-gray-800', ring: 'ring-red-600' },
  'North Carolina': { from: 'from-sky-400', to: 'to-sky-600', ring: 'ring-sky-500' },
  'VCU': { from: 'from-gray-800', to: 'to-yellow-600', ring: 'ring-gray-700' },
  'Illinois': { from: 'from-orange-600', to: 'to-blue-800', ring: 'ring-orange-500' },
  'Penn': { from: 'from-red-700', to: 'to-blue-700', ring: 'ring-red-600' },
  "Saint Mary's": { from: 'from-blue-700', to: 'to-red-700', ring: 'ring-blue-600' },
  'Texas A&M': { from: 'from-red-900', to: 'to-gray-800', ring: 'ring-red-800' },
  'Houston': { from: 'from-red-700', to: 'to-red-900', ring: 'ring-red-600' },
  'Idaho': { from: 'from-yellow-600', to: 'to-gray-700', ring: 'ring-yellow-600' },
};

// Default colors for teams not in the mapping
export const DEFAULT_COLORS: SchoolColors = {
  from: 'from-indigo-600',
  to: 'to-purple-700',
  ring: 'ring-indigo-500'
};

// Helper function to get school colors
export function getSchoolColors(teamName: string): SchoolColors {
  return SCHOOL_COLORS[teamName] || DEFAULT_COLORS;
}
