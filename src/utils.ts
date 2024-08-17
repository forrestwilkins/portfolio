export const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export const generateMelody = (numNotes: number) => {
  const melody: number[] = [];
  const durations: number[] = [];

  const baseFrequency = 440;
  const pentatonicScaleRatios = [1, 1.125, 1.25, 1.5, 1.75];
  const rhythmPattern = [0.25, 0.5, 0.25, 0.75, 0.25, 0.5, 0.25, 1];

  for (let i = 0; i < numNotes; i++) {
    const scaleDegree =
      pentatonicScaleRatios[
        Math.floor(Math.random() * pentatonicScaleRatios.length)
      ];

    const octave = Math.floor(Math.random() * 3) + 1;
    const frequency = baseFrequency * scaleDegree * octave;
    const duration = rhythmPattern[i % rhythmPattern.length];

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
