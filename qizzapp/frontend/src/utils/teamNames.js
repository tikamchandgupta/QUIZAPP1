// Mapping DB team identifiers to display names
const teamIdMap = {
  1: 'Moonshine coders',
  2: 'Crosscity coders',
  3: 'Synergy squad',
  4: 'Algoloom',
};

// Map various backend / DB names to display names
const teamNameMap = {
  // Generic labels
  'Team 1': 'Moonshine coders',
  'Team 2': 'Crosscity coders',
  'Team 3': 'Synergy squad',
  'Team 4': 'Algoloom',

  // IPL seed names from backend
  'Mumbai Indians': 'Moonshine coders',
  'Delhi Capitals': 'Crosscity coders',
  'Royal Challengers': 'Synergy squad',
  'Kolkata Knight Riders': 'Algoloom',
};

/**
 * Accepts either a team name (e.g. "Team 1") or
 * a team id (number or numeric string) and returns
 * the friendly display name.
 */
export const getDisplayTeamName = (nameOrId) => {
  // Try id-based mapping first
  if (typeof nameOrId === 'number' || /^\d+$/.test(String(nameOrId))) {
    const id = Number(nameOrId);
    if (teamIdMap[id]) {
      return teamIdMap[id];
    }
  }

  // Then try name-based mapping
  if (teamNameMap[nameOrId]) {
    return teamNameMap[nameOrId];
  }

  return nameOrId;
};


