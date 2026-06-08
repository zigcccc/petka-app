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

  it('should render nothing when canGoBack is false', async () => {
    await render(<ModalViewBackButton canGoBack={false} />);

    expect(screen.queryByRole('button', { name: /Nazaj/ })).not.toBeOnTheScreen();
  });

  it('should render nothing when canGoBack is not provided', async () => {
    await render(<ModalViewBackButton />);

    expect(screen.queryByRole('button', { name: /Nazaj/ })).not.toBeOnTheScreen();
  });

  it('should render the back button when canGoBack is true', async () => {
    await render(<ModalViewBackButton canGoBack />);

    expect(screen.queryByText('Nazaj')).toBeOnTheScreen();
  });

  it('should call router.back when pressed', async () => {
    await render(<ModalViewBackButton canGoBack />);

    await fireEvent.press(screen.getByText('Nazaj'));

    expect(mockBack).toHaveBeenCalled();
  });
});
