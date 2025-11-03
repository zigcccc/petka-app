import { capitalize } from './strings';

describe('capitalize', () => {
  it('capitalizes the first letter of a lowercase word', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('keeps the rest of the string unchanged', () => {
    expect(capitalize('hELLO')).toBe('HELLO');
  });

  it('returns null for undefined input', () => {
    expect(capitalize(undefined)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(capitalize(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(capitalize('')).toBeNull();
  });

  it('capitalizes a single lowercase character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('returns the same single uppercase character', () => {
    expect(capitalize('A')).toBe('A');
  });

  it('handles strings starting with non-letters', () => {
    expect(capitalize('123abc')).toBe('123abc');
    expect(capitalize('-word')).toBe('-word');
    expect(capitalize(' hello')).toBe(' hello');
  });

  it('handles multi-word strings but only capitalizes the first character', () => {
    expect(capitalize('hello world')).toBe('Hello world');
  });

  it('handles whitespace-only strings', () => {
    expect(capitalize('   ')).toBe('   ');
  });

  it('works with non-Latin characters (Unicode)', () => {
    expect(capitalize('ñandú')).toBe('Ñandú');
    expect(capitalize('σigma')).toBe('Σigma');
  });
});
