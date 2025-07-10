import { Octicons } from '@expo/vector-icons';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('<Button />', () => {
  it('should render button and respond to press event', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Press me!</Button>);

    fireEvent.press(screen.getByRole('button', { name: 'Press me!' }));

    expect(onPress).toHaveBeenCalled();
  });

  it('should render button loading indicator instead of text when loading=true', () => {
    render(
      <Button loading={true} onPress={jest.fn()}>
        Press me!
      </Button>
    );

    expect(screen.queryByText('Press me!')).not.toBeOnTheScreen();
    expect(screen.queryByRole('spinbutton')).toBeOnTheScreen();
  });

  it('should add size and color props to icon wrapper in <Button.Icon>', () => {
    render(
      <Button intent="danger" onPress={jest.fn()} size="lg">
        With icon{' '}
        <Button.Icon>
          <Octicons name="alert" testID="button-icon" />
        </Button.Icon>
      </Button>
    );

    expect(screen.getByTestId('button-icon')).toHaveProp('size', 20);
    expect(screen.getByTestId('button-icon')).toHaveProp('color');
  });

  it('should add testID and accessibilityLabel props to icon wrapper in <Button.Icon>', () => {
    render(
      <Button intent="danger" onPress={jest.fn()} size="lg">
        With icon{' '}
        <Button.Icon>
          <Octicons name="alert" />
        </Button.Icon>
      </Button>
    );

    expect(screen.queryByTestId('icon-alert')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /icon-alert/ })).toBeOnTheScreen();
  });
});
