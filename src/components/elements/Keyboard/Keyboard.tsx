import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';

import { keys, keysToIconMap, type KeyboardKey as KeyboardKeyType } from './Keyboard.constants';

type Props = {
  onKeyPress: (key: KeyboardKeyType) => void;
  misplacedCharacters: KeyboardKeyType[];
  invalidCharacters: KeyboardKeyType[];
  correctCharacters: KeyboardKeyType[];
};

export function Keyboard({ onKeyPress, misplacedCharacters, invalidCharacters, correctCharacters }: Props) {
  return (
    <View style={styles.keyboard}>
      {keys.map((keysRow, idx) => (
        <View key={idx} style={styles.keyboardRow}>
          {keysRow.map((key) => {
            const isCorrect = correctCharacters.includes(key);
            const isInvalid = invalidCharacters.includes(key);
            const isMisplaced = misplacedCharacters.includes(key);

            return (
              <Pressable
                key={key}
                onPress={() => onKeyPress(key)}
                style={({ pressed }) =>
                  styles.keyContainer({
                    pressed,
                    isCorrect,
                    isInvalid,
                    isMisplaced,
                  })
                }
              >
                <Text style={styles.keyText({ isInvalid, isMisplaced, isCorrect })} weight="bold">
                  {keysToIconMap.get(key) ?? key}
                </Text>
              </Pressable>
            );
          })}
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
  keyboardRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    justifyContent: 'space-around',
  },
  keyContainer: ({
    isCorrect,
    isInvalid,
    isMisplaced,
    pressed,
  }: {
    pressed: boolean;
    isInvalid: boolean;
    isMisplaced: boolean;
    isCorrect: boolean;
  }) => ({
    backgroundColor: isInvalid
      ? theme.colors.grey[70]
      : isMisplaced
        ? theme.colors.petka.yellow
        : isCorrect
          ? theme.colors.petka.green
          : theme.colors.grey[20],
    opacity: pressed ? 0.4 : 1,
    flexGrow: 1,
    height: 72,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  keyText: ({
    isCorrect,
    isInvalid,
    isMisplaced,
  }: {
    isInvalid: boolean;
    isMisplaced: boolean;
    isCorrect: boolean;
  }) => ({
    textTransform: 'uppercase',
    width: 22,
    textAlign: 'center',
    color: isInvalid || isMisplaced || isCorrect ? theme.colors.white : theme.colors.petka.black,
  }),
}));
