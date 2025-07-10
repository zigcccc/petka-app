import { render, screen } from '@testing-library/react-native';
import dayjs, { type Dayjs } from 'dayjs';

import { type Id } from '@/convex/_generated/dataModel';
import { type Puzzle, puzzleType } from '@/convex/puzzles/models';

import { HistoryGrid } from './HistoryGrid';

const testPuzzle = {
  _id: 'puzzle1' as Id<'puzzles'>,
  _creationTime: new Date('2023-01-01T00:00:00Z').getTime(),
  creatorId: 'creator1' as Id<'users'>,
  year: 2023,
  month: 1,
  day: 1,
  type: puzzleType.Enum.daily,
  solution: 'apple',
  solvedBy: [],
  attempts: [],
};

const today = dayjs();
const yesterday = today.subtract(1, 'day');

function getPuzzleWithDate(date: Dayjs, overrides = {}) {
  return {
    ...testPuzzle,
    year: date.year(),
    month: date.month() + 1,
    day: date.date(),
    ...overrides,
  } satisfies Puzzle;
}

describe('<HistoryGrid />', () => {
  it('renders without crashing', () => {
    render(<HistoryGrid puzzle={getPuzzleWithDate(today)} />);

    expect(screen.getByText(today.format('dddd, DD. MMM YYYY'))).toBeOnTheScreen();
  });

  it('shows solution for daily puzzle in the past', () => {
    const puzzle = getPuzzleWithDate(yesterday);
    render(<HistoryGrid puzzle={puzzle} />);

    expect(screen.getByText(/Rešitev:/)).toBeOnTheScreen();
    expect(screen.getByText(puzzle.solution)).toBeOnTheScreen();
  });

  it('shows solution for non-daily puzzle if solved', () => {
    const puzzle = { ...testPuzzle, type: puzzleType.Enum.training, solvedBy: ['user1'] };
    render(<HistoryGrid puzzle={puzzle} userId="user1" />);

    expect(screen.getByText(/Rešitev:/)).toBeOnTheScreen();
    expect(screen.getByText(puzzle.solution)).toBeOnTheScreen();
  });

  it('shows overlay for unsolved daily puzzle', () => {
    const puzzle = getPuzzleWithDate(today, { solvedBy: [] });
    render(<HistoryGrid puzzle={puzzle} userId="user1" />);

    expect(screen.getByText(/Dnevnega izziva še nisi rešil/)).toBeOnTheScreen();
  });

  it('shows overlay for unsolved daily puzzle in the past', () => {
    const puzzle = getPuzzleWithDate(yesterday, { solvedBy: [] });
    render(<HistoryGrid puzzle={puzzle} userId="user1" />);

    expect(screen.getByText(/Izziv je ostal ne rešen/)).toBeOnTheScreen();
  });

  it('renders 6 rows and 5 cells per row', () => {
    const puzzle = getPuzzleWithDate(today);
    render(<HistoryGrid puzzle={puzzle} />);
    // There should be 6*5 = 30 cells
    expect(screen.getAllByTestId(/cell-\d/).length).toBe(30);
  });

  it('renders attempts if provided', () => {
    const attempts = [
      {
        _id: 0,
        checkedLetters: [
          { letter: 'a', status: 'correct' },
          { letter: 'p', status: 'misplaced' },
          { letter: 'p', status: 'invalid' },
          { letter: 'l', status: 'invalid' },
          { letter: 'e', status: 'invalid' },
        ],
      },
    ];
    const puzzle = getPuzzleWithDate(today, { attempts });
    render(<HistoryGrid puzzle={puzzle} />);

    expect(screen.getByText('a')).toBeOnTheScreen();
    expect(screen.getAllByText('p').length).toBe(2);
    expect(screen.getByText('l')).toBeOnTheScreen();
    expect(screen.getByText('e')).toBeOnTheScreen();
  });

  it('renders with custom cellWidth', () => {
    const puzzle = getPuzzleWithDate(today);
    render(<HistoryGrid cellWidth={42} puzzle={puzzle} />);
    // No error means it works; could check props if GuessGrid.Cell was not mocked
    expect(screen.getAllByTestId(/cell-\d/).length).toBe(30);
  });

  it('renders without userId', () => {
    const puzzle = getPuzzleWithDate(today, { solvedBy: [] });
    render(<HistoryGrid puzzle={puzzle} />);
    expect(screen.getByText(today.format('dddd, DD. MMM YYYY'))).toBeOnTheScreen();
  });
});
