/**
 * Team Name Mapper
 * Maps external API team names to internal database team names
 * Handles common variations and abbreviations
 */

import { supabase } from '../supabase/client';
import type { Team } from '../types';

// Comprehensive mapping of external API team names to internal database names
// Add variations as you discover them from API responses
export const TEAM_NAME_MAP: Record<string, string> = {
  // Direct matches
  'Duke': 'Duke',
  'North Carolina': 'North Carolina',
  'Kansas': 'Kansas',
  'Villanova': 'Villanova',
  'Kentucky': 'Kentucky',
  'UCLA': 'UCLA',
  'Gonzaga': 'Gonzaga',
  'Arizona': 'Arizona',

  // Common variations with full names
  'Duke Blue Devils': 'Duke',
  'North Carolina Tar Heels': 'North Carolina',
  'UNC Tar Heels': 'North Carolina',
  'Kansas Jayhawks': 'Kansas',
  'Villanova Wildcats': 'Villanova',
  'Kentucky Wildcats': 'Kentucky',
  'UCLA Bruins': 'UCLA',
  'Gonzaga Bulldogs': 'Gonzaga',
  'Arizona Wildcats': 'Arizona',

  // Abbreviations
  'UNC': 'North Carolina',
  'UK': 'Kentucky',

  // State schools
  'Michigan': 'Michigan',
  'Michigan Wolverines': 'Michigan',
  'Michigan State': 'Michigan State',
  'Michigan State Spartans': 'Michigan State',
  'MSU': 'Michigan State',
  'Ohio State': 'Ohio State',
  'Ohio State Buckeyes': 'Ohio State',
  'OSU': 'Ohio State',

  // TODO: Add all 68 tournament teams as you discover their API names
  // This is a starter set - expand based on actual API responses
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
