// Mapping DB team identifiers to display names
const teamIdMap = {
  1: 'Moonshine coders',
  2: 'Crosscity coders',
  3: 'Algoloom',
  4: 'Synergy squad',
};

// Map various backend / DB names to display names
const teamNameMap = {
  // Direct names from backend
  'Moonshine coders': 'Moonshine coders',
  'Crosscity coders': 'Crosscity coders',
  'Algoloom': 'Algoloom',
  'Synergy squad': 'Synergy squad',

  // Generic labels
  'Team 1': 'Moonshine coders',
  'Team 2': 'Crosscity coders',
  'Team 3': 'Algoloom',
  'Team 4': 'Synergy squad',

  // IPL seed names from backend (legacy)
  'Mumbai Indians': 'Moonshine coders',
  'Delhi Capitals': 'Crosscity coders',
  'Royal Challengers': 'Algoloom',
  'Kolkata Knight Riders': 'Synergy squad',
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


