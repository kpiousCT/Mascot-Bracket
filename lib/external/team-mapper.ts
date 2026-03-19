/**
 * Team Name Mapper
 * Maps external API team names to internal database team names
 * Handles common variations and abbreviations
 */

import { supabase } from '../supabase/client';
import type { Team } from '../types';

// Comprehensive mapping of external API team names to internal database names
// Maps all 68 tournament teams with common variations
export const TEAM_NAME_MAP: Record<string, string> = {
  // Akron
  'Akron': 'Akron',
  'Akron Zips': 'Akron',

  // Alabama
  'Alabama': 'Alabama',
  'Alabama Crimson Tide': 'Alabama',

  // Arizona
  'Arizona': 'Arizona',
  'Arizona Wildcats': 'Arizona',

  // Arkansas
  'Arkansas': 'Arkansas',
  'Arkansas Razorbacks': 'Arkansas',

  // BYU
  'BYU': 'BYU',
  'BYU Cougars': 'BYU',
  'Brigham Young': 'BYU',

  // Cal Baptist
  'Cal Baptist': 'Cal Baptist',
  'Cal Baptist Lancers': 'Cal Baptist',
  'California Baptist': 'Cal Baptist',

  // Clemson
  'Clemson': 'Clemson',
  'Clemson Tigers': 'Clemson',

  // Duke
  'Duke': 'Duke',
  'Duke Blue Devils': 'Duke',

  // Florida
  'Florida': 'Florida',
  'Florida Gators': 'Florida',

  // Furman
  'Furman': 'Furman',
  'Furman Paladins': 'Furman',

  // Georgia
  'Georgia': 'Georgia',
  'Georgia Bulldogs': 'Georgia',

  // Gonzaga
  'Gonzaga': 'Gonzaga',
  'Gonzaga Bulldogs': 'Gonzaga',

  // Hawaii
  'Hawaii': 'Hawaii',
  'Hawaii Warriors': 'Hawaii',

  // High Point
  'High Point': 'High Point',
  'High Point Panthers': 'High Point',

  // Hofstra
  'Hofstra': 'Hofstra',
  'Hofstra Pride': 'Hofstra',

  // Houston
  'Houston': 'Houston',
  'Houston Cougars': 'Houston',

  // Howard
  'Howard': 'Howard',
  'Howard Bison': 'Howard',

  // Idaho
  'Idaho': 'Idaho',
  'Idaho Vandals': 'Idaho',

  // Illinois
  'Illinois': 'Illinois',
  'Illinois Fighting Illini': 'Illinois',

  // Iowa
  'Iowa': 'Iowa',
  'Iowa Hawkeyes': 'Iowa',

  // Iowa State
  'Iowa State': 'Iowa State',
  'Iowa State Cyclones': 'Iowa State',
  'Iowa St': 'Iowa State',
  'Iowa St Cyclones': 'Iowa State',

  // Kansas
  'Kansas': 'Kansas',
  'Kansas Jayhawks': 'Kansas',

  // Kennesaw State
  'Kennesaw State': 'Kennesaw State',
  'Kennesaw State Owls': 'Kennesaw State',
  'Kennesaw St': 'Kennesaw State',

  // Kentucky
  'Kentucky': 'Kentucky',
  'Kentucky Wildcats': 'Kentucky',

  // LIU
  'LIU': 'LIU',
  'LIU Sharks': 'LIU',
  'Long Island': 'LIU',

  // Louisville
  'Louisville': 'Louisville',
  'Louisville Cardinals': 'Louisville',

  // McNeese
  'McNeese': 'McNeese',
  'McNeese Cowboys': 'McNeese',
  'McNeese State': 'McNeese',

  // Miami
  'Miami': 'Miami',
  'Miami Hurricanes': 'Miami',
  'Miami (FL)': 'Miami',
  'Miami FL': 'Miami',

  // Miami (Ohio)
  'Miami (Ohio)': 'Miami (Ohio)',
  'Miami (OH)': 'Miami (Ohio)',
  'Miami OH': 'Miami (Ohio)',
  'Miami RedHawks': 'Miami (Ohio)',
  'Miami (OH) RedHawks': 'Miami (Ohio)',

  // Michigan
  'Michigan': 'Michigan',
  'Michigan Wolverines': 'Michigan',

  // Michigan State
  'Michigan State': 'Michigan State',
  'Michigan State Spartans': 'Michigan State',
  'Michigan St': 'Michigan State',
  'MSU': 'Michigan State',

  // Missouri
  'Missouri': 'Missouri',
  'Missouri Tigers': 'Missouri',

  // Nebraska
  'Nebraska': 'Nebraska',
  'Nebraska Cornhuskers': 'Nebraska',

  // North Carolina
  'North Carolina': 'North Carolina',
  'North Carolina Tar Heels': 'North Carolina',
  'UNC': 'North Carolina',
  'UNC Tar Heels': 'North Carolina',

  // North Dakota State
  'North Dakota State': 'North Dakota State',
  'North Dakota State Bison': 'North Dakota State',
  'North Dakota St': 'North Dakota State',
  'NDSU': 'North Dakota State',

  // Northern Iowa
  'Northern Iowa': 'Northern Iowa',
  'Northern Iowa Panthers': 'Northern Iowa',
  'UNI': 'Northern Iowa',

  // Ohio State
  'Ohio State': 'Ohio State',
  'Ohio State Buckeyes': 'Ohio State',
  'Ohio St': 'Ohio State',
  'OSU': 'Ohio State',

  // Penn
  'Penn': 'Penn',
  'Penn Quakers': 'Penn',
  'Pennsylvania': 'Penn',

  // Prairie View A&M
  'Prairie View A&M': 'Prairie View A&M',
  'Prairie View': 'Prairie View A&M',
  'Prairie View Panthers': 'Prairie View A&M',
  'Prairie View A&M Panthers': 'Prairie View A&M',

  // Purdue
  'Purdue': 'Purdue',
  'Purdue Boilermakers': 'Purdue',

  // Queens
  'Queens': 'Queens',
  'Queens Royals': 'Queens',
  'Queens (NC)': 'Queens',

  // Saint Louis
  'Saint Louis': 'Saint Louis',
  'Saint Louis Billikens': 'Saint Louis',
  'St. Louis': 'Saint Louis',
  'SLU': 'Saint Louis',

  // Saint Mary's
  "Saint Mary's": "Saint Mary's",
  "Saint Mary's Gaels": "Saint Mary's",
  "St. Mary's": "Saint Mary's",
  "St Mary's": "Saint Mary's",

  // Santa Clara
  'Santa Clara': 'Santa Clara',
  'Santa Clara Broncos': 'Santa Clara',

  // Siena
  'Siena': 'Siena',
  'Siena Saints': 'Siena',

  // South Florida
  'South Florida': 'South Florida',
  'South Florida Bulls': 'South Florida',
  'USF': 'South Florida',

  // St. John's
  "St. John's": "St. John's",
  "St. John's Red Storm": "St. John's",
  "Saint John's": "St. John's",
  'St Johns': "St. John's",

  // TCU
  'TCU': 'TCU',
  'TCU Horned Frogs': 'TCU',
  'Texas Christian': 'TCU',

  // Tennessee
  'Tennessee': 'Tennessee',
  'Tennessee Volunteers': 'Tennessee',
  'Tennessee Vols': 'Tennessee',

  // Tennessee State
  'Tennessee State': 'Tennessee State',
  'Tennessee State Tigers': 'Tennessee State',
  'Tennessee St': 'Tennessee State',

  // Texas
  'Texas': 'Texas',
  'Texas Longhorns': 'Texas',

  // Texas A&M
  'Texas A&M': 'Texas A&M',
  'Texas A&M Aggies': 'Texas A&M',
  'TAMU': 'Texas A&M',

  // Texas Tech
  'Texas Tech': 'Texas Tech',
  'Texas Tech Red Raiders': 'Texas Tech',
  'TTU': 'Texas Tech',

  // Troy
  'Troy': 'Troy',
  'Troy Trojans': 'Troy',

  // UCF
  'UCF': 'UCF',
  'UCF Knights': 'UCF',
  'Central Florida': 'UCF',

  // UCLA
  'UCLA': 'UCLA',
  'UCLA Bruins': 'UCLA',

  // UConn
  'UConn': 'UConn',
  'UConn Huskies': 'UConn',
  'Connecticut': 'UConn',

  // Utah State
  'Utah State': 'Utah State',
  'Utah State Aggies': 'Utah State',
  'Utah St': 'Utah State',

  // Vanderbilt
  'Vanderbilt': 'Vanderbilt',
  'Vanderbilt Commodores': 'Vanderbilt',
  'Vandy': 'Vanderbilt',

  // VCU
  'VCU': 'VCU',
  'VCU Rams': 'VCU',
  'Virginia Commonwealth': 'VCU',

  // Villanova
  'Villanova': 'Villanova',
  'Villanova Wildcats': 'Villanova',
  'Nova': 'Villanova',

  // Virginia
  'Virginia': 'Virginia',
  'Virginia Cavaliers': 'Virginia',
  'UVA': 'Virginia',

  // Wisconsin
  'Wisconsin': 'Wisconsin',
  'Wisconsin Badgers': 'Wisconsin',

  // Wright State
  'Wright State': 'Wright State',
  'Wright State Raiders': 'Wright State',
  'Wright St': 'Wright State',
};

/**
 * Normalizes team name from external API to internal format
 * @param externalName - Team name from external API
 * @returns Internal team name or null if not found
 */
export function normalizeTeamName(externalName: string): string | null {
  // Try exact match first
  if (TEAM_NAME_MAP[externalName]) {
    return TEAM_NAME_MAP[externalName];
  }

  // Try case-insensitive match
  const lowerName = externalName.toLowerCase();
  for (const [key, value] of Object.entries(TEAM_NAME_MAP)) {
    if (key.toLowerCase() === lowerName) {
      return value;
    }
  }

  // Try partial match (remove common suffixes)
  const suffixes = ['Blue Devils', 'Tar Heels', 'Wildcats', 'Bulldogs', 'Jayhawks', 'Bruins', 'Buckeyes', 'Spartans', 'Wolverines'];
  for (const suffix of suffixes) {
    if (externalName.endsWith(suffix)) {
      const baseName = externalName.replace(suffix, '').trim();
      if (TEAM_NAME_MAP[baseName]) {
        return TEAM_NAME_MAP[baseName];
      }
    }
  }

  // No match found
  return null;
}

/**
 * Finds team in database by name
 * @param internalTeamName - Normalized internal team name
 * @param region - Optional region filter
 * @param seed - Optional seed filter
 * @returns Team object or null if not found
 */
export async function findTeamByName(
  internalTeamName: string,
  region?: string,
  seed?: number
): Promise<Team | null> {
  try {
    let query = supabase
      .from('teams')
      .select('*')
      .eq('name', internalTeamName);

    if (region) {
      query = query.eq('region', region);
    }

    if (seed !== undefined) {
      query = query.eq('seed', seed);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      throw error;
    }

    return data as Team;
  } catch (error) {
    console.error('Error finding team:', error);
    return null;
  }
}

/**
 * Maps external team name to internal team ID
 * @param externalName - Team name from external API
 * @param region - Optional region hint
 * @param seed - Optional seed hint
 * @returns Team ID or null if not found
 */
export async function mapTeamNameToId(
  externalName: string,
  region?: string,
  seed?: number
): Promise<string | null> {
  // Normalize external name to internal name
  const internalName = normalizeTeamName(externalName);

  if (!internalName) {
    console.warn(`[Team Mapper] No mapping found for external team name: "${externalName}"`);
    return null;
  }

  // Find team in database
  const team = await findTeamByName(internalName, region, seed);

  if (!team) {
    console.warn(`[Team Mapper] Team not found in database: "${internalName}" (from "${externalName}")`);
    return null;
  }

  return team.id;
}

/**
 * Validates all teams in database have mappings
 * Useful for pre-tournament setup
 * @returns Array of team names missing from TEAM_NAME_MAP
 */
export async function validateTeamMappings(): Promise<string[]> {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select('name');

    if (error) throw error;

    const missingMappings: string[] = [];

    for (const team of teams || []) {
      // Check if team name exists as a value in TEAM_NAME_MAP
      const hasMappingAsValue = Object.values(TEAM_NAME_MAP).includes(team.name);
      // Check if team name exists as a key in TEAM_NAME_MAP
      const hasMappingAsKey = TEAM_NAME_MAP[team.name] !== undefined;

      if (!hasMappingAsValue && !hasMappingAsKey) {
        missingMappings.push(team.name);
      }
    }

    return missingMappings;
  } catch (error) {
    console.error('Error validating team mappings:', error);
    return [];
  }
}

/**
 * Adds a new team name mapping dynamically
 * Useful for fixing missing mappings discovered during sync
 * Note: This only updates the in-memory map, not persisted
 */
export function addTeamMapping(externalName: string, internalName: string): void {
  TEAM_NAME_MAP[externalName] = internalName;
  console.log(`[Team Mapper] Added mapping: "${externalName}" -> "${internalName}"`);
}
