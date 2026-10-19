import { horizontalSafePadding } from './insets';

describe('horizontalSafePadding', () => {
  it('returns the plain padding when there are no horizontal insets', () => {
    expect(horizontalSafePadding({ left: 0, right: 0 }, 20)).toEqual({ paddingLeft: 20, paddingRight: 20 });
  });

  it('adds the left and right insets to the padding on their respective sides', () => {
    expect(horizontalSafePadding({ left: 10, right: 84 }, 20)).toEqual({ paddingLeft: 30, paddingRight: 104 });
  });
});
