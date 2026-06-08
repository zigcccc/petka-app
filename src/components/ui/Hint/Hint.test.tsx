import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Text } from 'react-native';

import { defaultTheme } from '@/styles/themes';

import { Hint } from './Hint';

describe('<Hint />', () => {
  it('should render hint with title and content', async () => {
    await render(
      <Hint title="Watch out!">
        <Text>Here I come...</Text>
      </Hint>
    );

    expect(screen.queryByText('Watch out!')).toBeOnTheScreen();
    expect(screen.queryByText('Here I come...')).toBeOnTheScreen();
  });

  it('should render hint with title, content, and additional action(s) if passed', async () => {
    const onPress = jest.fn();
    await render(
      <Hint actions={<Button onPress={onPress} title="Stop me" />} intent="info" title="Watch out!">
        <Text>Here I come...</Text>
      </Hint>
    );

    expect(screen.queryByText('Watch out!')).toBeOnTheScreen();
    expect(screen.queryByText('Here I come...')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Stop me' }));

    expect(onPress).toHaveBeenCalled();
  });

  it.each([
    { intent: 'success', expectedIconColor: defaultTheme.colors.green[40] },
    { intent: 'info', expectedIconColor: defaultTheme.colors.blue[40] },
    { intent: 'warning', expectedIconColor: defaultTheme.colors.gold[40] },
    { intent: 'danger', expectedIconColor: defaultTheme.colors.red[40] },
  ] as const)('should render hint icon with color set to $expectedIconColor when intent=$intent', async ({
    intent,
    expectedIconColor,
  }) => {
    await render(
      <Hint intent={intent} title="Watch out!">
        <Text>Here I come...</Text>
      </Hint>
    );

    expect(screen.getByTestId('hint--icon')).toHaveStyle({ color: expectedIconColor });
  });
});
