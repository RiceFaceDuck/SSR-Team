/**
 * Format a player's name to abbreviated style: "FirstInitial. LastName"
 * Example: "Cristiano Ronaldo" -> "C. Ronaldo", "Rodri" -> "Rodri"
 */
export const formatPlayerName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ');
  return `${firstName.charAt(0)}. ${lastName}`;
};

/**
 * Format a team's name to a 3-letter abbreviation if shortName is not provided.
 * In a real scenario, this should use the team's official short name (e.g., MUN).
 * Example: "Manchester United" -> "MUN", "Arsenal" -> "ARS"
 */
export const formatTeamShortName = (name, shortName) => {
  if (shortName) return shortName.toUpperCase();
  if (!name) return '';
  // Fallback: take first 3 letters and uppercase
  return name.substring(0, 3).toUpperCase();
};
