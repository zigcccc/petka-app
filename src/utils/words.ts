type WordEntry = {
  word: string;
  frequency: number;
  numOfTimesUsed: number;
};

export function pickRandomWord(words: WordEntry[], decayFactor = 1.75): string {
  if (words.length === 0) throw new Error('No words to choose from');

  const weights = words.map((w) => {
    return w.frequency / Math.pow(1 + w.numOfTimesUsed, decayFactor);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let rand = Math.random() * totalWeight;

  for (let i = 0; i < words.length; i++) {
    rand -= weights[i];
    if (rand <= 0) {
      return words[i].word;
    }
  }

  return words[words.length - 1].word;
}
