import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { keys, type KeyboardKey as KeyboardKeyType } from './Keyboard.constants';
import { KeyboardKey } from './KeyboardKey';

type Props = {
  onKeyPress: (key: KeyboardKeyType) => void;
};

export function Keyboard({ onKeyPress }: Props) {
  const [charBubble, setCharBubble] = useState<null | KeyboardKeyType>(null);

  return (
    <View style={styles.keyboard}>
      {keys.map((keysRow, idx) => (
        <View key={idx} style={styles.keyboardRow({ isShrunk: idx === 1 })}>
          {keysRow.map((key) => (
            <KeyboardKey
              key={key}
              charBubble={charBubble}
              onKeyPress={onKeyPress}
              onSetCharBubble={setCharBubble}
              value={key}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  keyboard: {
    flexDirection: 'column',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  keyboardRow: ({ isShrunk }: { isShrunk: boolean }) => ({
    flexDirection: 'row',
    gap: theme.spacing[2],
    justifyContent: 'space-around',
    paddingHorizontal: isShrunk ? 12 : 0,
  }),
}));
