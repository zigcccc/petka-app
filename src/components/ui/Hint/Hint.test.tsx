import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Text } from 'react-native';

import { Hint } from './Hint';

describe('<Hint />', () => {
  it('should render hint with title and content', () => {
    render(
      <Hint title="Watch out!">
        <Text>Here I come...</Text>
      </Hint>
    );

    expect(screen.queryByText('Watch out!')).toBeOnTheScreen();
    expect(screen.queryByText('Here I come...')).toBeOnTheScreen();
  });

  it('should render hint with title, content, and additional action(s) if passed', () => {
    const onPress = jest.fn();
    render(
      <Hint actions={<Button onPress={onPress} title="Stop me" />} intent="info" title="Watch out!">
        <Text>Here I come...</Text>
      </Hint>
    );

    expect(screen.queryByText('Watch out!')).toBeOnTheScreen();
    expect(screen.queryByText('Here I come...')).toBeOnTheScreen();

    fireEvent.press(screen.getByRole('button', { name: 'Stop me' }));

    expect(onPress).toHaveBeenCalled();
  });
});
