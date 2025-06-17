import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('<Button />', () => {
  it('should render button and respond to press event', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Press me!</Button>);

    fireEvent.press(screen.getByRole('button', { name: 'Press me!' }));

    expect(onPress).toHaveBeenCalled();
  });
});
