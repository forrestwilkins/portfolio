/**
 * Get a random number between min and max
 */
export const getRandom = (min: number, max: number) => {
  return Math.floor(Math.random() * max) + min;
};

/**
 * Constrain a number between a low and high value
 */
export const constrain = (n: number, low: number, high: number) => {
  return Math.max(Math.min(n, high), low);
};

/**
 * Map a value from one range to another
 */
export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) => {
  const proportion = (value - inMin) / (inMax - inMin);
  return outMin + proportion * (outMax - outMin);
};
