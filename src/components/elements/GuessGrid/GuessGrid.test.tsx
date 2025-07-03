import { render, screen, within } from '@testing-library/react-native';

import { type Id } from '@/convex/_generated/dataModel';
import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';
import { defaultTheme } from '@/styles/themes';

import { GuessGrid } from './GuessGrid';

describe('<GuessGrid />', () => {
  const testGrid = [
    ['a', 'p', 'p', 'l', 'e'],
    ['p', 'a', 'l', 'm', 's'],
    ['p', 's', 'a', 'l', 'm'],
    [null, null, null, null, null],
    [null, null, null, null, null],
    [null, null, null, null, null],
  ];

  it('should render the grid', () => {
    render(<GuessGrid grid={testGrid} />);
    expect(screen.getAllByTestId(/guess-grid--row-\d--cell-\d/).length).toBe(30);
  });

  it('should render the grid cells according to received attempts', () => {
    const attempt1 = {
      _id: 'attemp1' as Id<'puzzleGuessAttempts'>,
      _creationTime: Date.now(),
      puzzleId: 'puzzle1' as Id<'puzzles'>,
      userId: 'user1' as Id<'users'>,
      attempt: 'apple',
      checkedLetters: [
        { letter: 'a', index: 0, status: checkedLetterStatus.Enum.misplaced },
        { letter: 'p', index: 1, status: checkedLetterStatus.Enum.misplaced },
        { letter: 'p', index: 2, status: checkedLetterStatus.Enum.invalid },
        { letter: 'l', index: 3, status: checkedLetterStatus.Enum.misplaced },
        { letter: 'e', index: 4, status: checkedLetterStatus.Enum.misplaced },
      ],
    };
    const attempt2 = {
      _id: 'attemp1' as Id<'puzzleGuessAttempts'>,
      _creationTime: Date.now(),
      puzzleId: 'puzzle1' as Id<'puzzles'>,
      userId: 'user1' as Id<'users'>,
      attempt: 'palms',
      checkedLetters: [
        { letter: 'p', index: 0, status: checkedLetterStatus.Enum.correct },
        { letter: 'a', index: 1, status: checkedLetterStatus.Enum.misplaced },
        { letter: 'l', index: 2, status: checkedLetterStatus.Enum.misplaced },
        { letter: 'm', index: 3, status: checkedLetterStatus.Enum.misplaced },
        { letter: 's', index: 4, status: checkedLetterStatus.Enum.misplaced },
      ],
    };
    const attempt3 = {
      _id: 'attemp1' as Id<'puzzleGuessAttempts'>,
      _creationTime: Date.now(),
      puzzleId: 'puzzle1' as Id<'puzzles'>,
      userId: 'user1' as Id<'users'>,
      attempt: 'psalm',
      checkedLetters: [
        { letter: 'p', index: 0, status: checkedLetterStatus.Enum.correct },
        { letter: 's', index: 1, status: checkedLetterStatus.Enum.correct },
        { letter: 'a', index: 2, status: checkedLetterStatus.Enum.correct },
        { letter: 'l', index: 3, status: checkedLetterStatus.Enum.correct },
        { letter: 'm', index: 4, status: checkedLetterStatus.Enum.correct },
      ],
    };

    render(<GuessGrid attempts={[attempt1, attempt2, attempt3]} grid={testGrid} />);

    // Row 0 -> attempt 1
    expect(screen.getByTestId('guess-grid--row-0--cell-0')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });
    expect(screen.getByTestId('guess-grid--row-0--cell-1')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });
    expect(screen.getByTestId('guess-grid--row-0--cell-2')).toHaveStyle({
      backgroundColor: defaultTheme.colors.grey[70],
      borderColor: defaultTheme.colors.grey[70],
    });
    expect(screen.getByTestId('guess-grid--row-0--cell-3')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });
    expect(screen.getByTestId('guess-grid--row-0--cell-4')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });

    // Row 1 -> attempt 2
    expect(screen.getByTestId('guess-grid--row-1--cell-0')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.green,
      borderColor: defaultTheme.colors.petka.green,
    });
    expect(screen.getByTestId('guess-grid--row-1--cell-1')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });
    expect(screen.getByTestId('guess-grid--row-1--cell-2')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });
    expect(screen.getByTestId('guess-grid--row-1--cell-3')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });
    expect(screen.getByTestId('guess-grid--row-1--cell-4')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.yellow,
      borderColor: defaultTheme.colors.petka.yellow,
    });

    // Row 2 -> attempt 4
    expect(screen.getByTestId('guess-grid--row-2--cell-0')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.green,
      borderColor: defaultTheme.colors.petka.green,
    });
    expect(screen.getByTestId('guess-grid--row-2--cell-1')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.green,
      borderColor: defaultTheme.colors.petka.green,
    });
    expect(screen.getByTestId('guess-grid--row-2--cell-2')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.green,
      borderColor: defaultTheme.colors.petka.green,
    });
    expect(screen.getByTestId('guess-grid--row-2--cell-3')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.green,
      borderColor: defaultTheme.colors.petka.green,
    });
    expect(screen.getByTestId('guess-grid--row-2--cell-4')).toHaveStyle({
      backgroundColor: defaultTheme.colors.petka.green,
      borderColor: defaultTheme.colors.petka.green,
    });

    // Row 3 -> no attemps
    within(screen.getByTestId('guess-grid--row-3'))
      .getAllByTestId(/guess-grid--row-3--cell-\d/)
      .forEach((cell) => {
        expect(cell).toHaveStyle({
          backgroundColor: defaultTheme.colors.grey[10],
          borderColor: defaultTheme.colors.grey[20],
        });
      });
  });
});
