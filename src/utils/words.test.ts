import { pickRandomWord } from './words';

describe('pickRandomWord', () => {
  const words = [
    { word: 'apple', frequency: 10, numOfTimesUsed: 0 },
    { word: 'banana', frequency: 5, numOfTimesUsed: 2 },
    { word: 'cherry', frequency: 2, numOfTimesUsed: 5 },
  ];

  beforeEach(() => {
    jest.spyOn(global.Math, 'random');
  });

  afterEach(() => {
    (Math.random as jest.Mock).mockRestore();
  });

  it('should throw an error when given an empty array', () => {
    expect(() => pickRandomWord([])).toThrow('No words to choose from');
  });

  it('should return the expected word based on controlled random number (first item)', () => {
    (Math.random as jest.Mock).mockReturnValue(0.00001);
    const result = pickRandomWord(words);
    expect(result).toBe('apple');
  });

  it('should return the expected word based on controlled random number (last item)', () => {
    (Math.random as jest.Mock).mockReturnValue(0.999);
    const result = pickRandomWord(words);
    expect(result).toBe('cherry');
  });

  it('should respect decayFactor (higher decay penalizes used words more)', () => {
    const lowDecayResult = pickRandomWord(words, 0.5);
    const highDecayResult = pickRandomWord(words, 5);

    expect(['apple', 'banana', 'cherry']).toContain(lowDecayResult);
    expect(['apple', 'banana', 'cherry']).toContain(highDecayResult);
  });
});
