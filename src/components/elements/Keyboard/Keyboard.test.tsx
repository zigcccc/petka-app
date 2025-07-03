import { render, screen, fireEvent } from '@testing-library/react-native';

import { checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';
import { defaultTheme } from '@/styles/themes';

import { Keyboard } from './Keyboard';

describe('<Keyboard />', () => {
  it('should render without crashing', () => {
    render(
      <Keyboard
        checkedLetters={[{ index: 1, letter: 'a', status: 'correct' }]}
        isDisabled={false}
        onKeyPress={() => {}}
      />
    );
    expect(screen.getByText('a')).toBeOnTheScreen();
  });

  it('should call onKeyPress when a key is pressed', () => {
    const mockOnKeyPress = jest.fn();
    render(<Keyboard checkedLetters={[]} isDisabled={false} onKeyPress={mockOnKeyPress} />);

    fireEvent.press(screen.getByText('a'));
    expect(mockOnKeyPress).toHaveBeenCalledWith('a');
  });

  it('should not call onKeyPress when disabled', () => {
    const mockOnKeyPress = jest.fn();
    render(<Keyboard checkedLetters={[]} isDisabled={true} onKeyPress={mockOnKeyPress} />);

    fireEvent.press(screen.getByText('a'));
    expect(mockOnKeyPress).not.toHaveBeenCalled();
  });

  it('should render icons for special keys', () => {
    render(<Keyboard checkedLetters={[]} isDisabled={false} onKeyPress={() => {}} />);

    expect(screen.getByTestId('keyboard-icon--backspace')).toBeOnTheScreen();
    expect(screen.getByTestId('keyboard-icon--enter')).toBeOnTheScreen();
  });

  it('should apply styles based on checked letters status', () => {
    const checkedLetters = [
      { index: 0, letter: 'a', status: checkedLetterStatus.Enum.correct },
      { index: 1, letter: 'b', status: checkedLetterStatus.Enum.misplaced },
      { index: 2, letter: 'c', status: checkedLetterStatus.Enum.invalid },
    ];
    render(<Keyboard checkedLetters={checkedLetters} isDisabled={false} onKeyPress={() => {}} />);

    expect(screen.getByTestId('keyboard-key--a')).toHaveStyle({ backgroundColor: defaultTheme.colors.petka.green });
    expect(screen.getByTestId('keyboard-key--b')).toHaveStyle({ backgroundColor: defaultTheme.colors.petka.yellow });
    expect(screen.getByTestId('keyboard-key--c')).toHaveStyle({ backgroundColor: defaultTheme.colors.grey[70] });

    expect(screen.getByText('a')).toHaveStyle({ color: defaultTheme.colors.white });
    expect(screen.getByText('b')).toHaveStyle({ color: defaultTheme.colors.white });
    expect(screen.getByText('c')).toHaveStyle({ color: defaultTheme.colors.white });
  });

  it('should render correctly when checkedLetters prop is omitted', () => {
    render(<Keyboard isDisabled={false} onKeyPress={() => {}} />);
    // Should render at least one key (e.g., 'a')
    expect(screen.getByTestId('keyboard-key--a')).toBeOnTheScreen();
  });
});
