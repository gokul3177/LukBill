/**
 * Levenshtein Distance function to calculate similarity between two strings
 * Returns a score between 0 and 100
 */
const getLevenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const getSimilarityScore = (str1, str2) => {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 100;
  const distance = getLevenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return Math.round(((maxLength - distance) / maxLength) * 100);
};

const fuzzyMatchMedicine = (inputName, inventoryList) => {
  let bestMatch = null;
  let highestScore = 0;

  for (const item of inventoryList) {
    const score = getSimilarityScore(inputName, item.name);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Threshold is 80% as per requirements
  if (highestScore >= 80) {
    return { match: bestMatch, score: highestScore };
  }
  
  return { match: null, score: highestScore };
};

module.exports = { fuzzyMatchMedicine, getSimilarityScore };
