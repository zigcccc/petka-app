import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { ModalViewBackButton } from './ModalViewBackButton';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  useRouter: jest.fn(),
}));

describe('<ModalViewBackButton />', () => {
  const useRouterSpy = useRouter as jest.Mock;
  const mockBack = jest.fn();

  beforeEach(() => {
    useRouterSpy.mockReturnValue({ back: mockBack });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when canGoBack is false', () => {
    render(<ModalViewBackButton canGoBack={false} />);

    expect(screen.queryByRole('button', { name: /Nazaj/ })).not.toBeOnTheScreen();
  });

  it('should render nothing when canGoBack is not provided', () => {
    render(<ModalViewBackButton />);

    expect(screen.queryByRole('button', { name: /Nazaj/ })).not.toBeOnTheScreen();
  });

  it('should render the back button when canGoBack is true', () => {
    render(<ModalViewBackButton canGoBack />);

    expect(screen.queryByText('Nazaj')).toBeOnTheScreen();
  });

  it('should call router.back when pressed', () => {
    render(<ModalViewBackButton canGoBack />);

    fireEvent.press(screen.getByText('Nazaj'));

    expect(mockBack).toHaveBeenCalled();
  });
});
