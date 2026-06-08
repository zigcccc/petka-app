import { fireEvent, render, screen } from '@testing-library/react-native';
import { AlertTriangleIcon } from 'lucide-react-native';
import { Text } from 'react-native';

import { Button } from './Button';

describe('<Button />', () => {
  it('should render button and respond to press event', async () => {
    const onPress = jest.fn();
    await render(<Button onPress={onPress}>Press me!</Button>);

    await fireEvent.press(screen.getByRole('button', { name: 'Press me!' }));

    expect(onPress).toHaveBeenCalled();
  });

  it('should render button loading indicator instead of text when loading=true', async () => {
    await render(
      <Button loading={true} onPress={jest.fn()}>
        Press me!
      </Button>
    );

    expect(screen.queryByText('Press me!')).not.toBeOnTheScreen();
    expect(screen.queryByRole('progressbar')).toBeOnTheScreen();
  });

  it('should add size and color props to icon wrapper in <Button.Icon>', async () => {
    await render(
      <Button intent="danger" onPress={jest.fn()} size="lg">
        <Text>With icon</Text>
        <Button.Icon>
          <AlertTriangleIcon testID="button-icon" />
        </Button.Icon>
      </Button>
    );

    expect(screen.getByTestId('button-icon')).toHaveProp('size', 20);
    expect(screen.getByTestId('button-icon')).toHaveProp('color');
  });

  it('should add testID and accessibilityLabel props to icon wrapper in <Button.Icon>', async () => {
    await render(
      <Button intent="danger" onPress={jest.fn()} size="lg">
        <Text>With icon</Text>
        <Button.Icon>
          <AlertTriangleIcon />
        </Button.Icon>
      </Button>
    );

    expect(screen.queryByTestId('icon-AlertTriangleIcon')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /icon-AlertTriangleIcon/ })).toBeOnTheScreen();
  });
});
