export const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const generateMelody = (numNotes: number) => {
  const melody: number[] = [];
  const durations: number[] = [];

  for (let i = 0; i < numNotes; i++) {
    const frequency = getRandom(20, 4000);
    const duration = Math.random() * 0.1 + 0.1;
    melody.push(frequency);
    durations.push(duration);
  }

  return { melody, durations };
};

export const convertFrequencyToColor = (frequency: number) => {
  const h = (frequency / 4000) * 360;
  const s = 100;
  const l = 50;

  return `hsl(${h}, ${s}%, ${l}%)`;
};
