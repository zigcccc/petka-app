import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { type CheckedLetter, checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';

import { keys, keysToIconMap, type KeyboardKey as KeyboardKeyType } from './Keyboard.constants';

type Props = {
  onKeyPress: (key: KeyboardKeyType) => void;
  checkedLetters?: CheckedLetter[];
  isDisabled: boolean;
};

export function Keyboard({ isDisabled, onKeyPress, checkedLetters = [] }: Readonly<Props>) {
  return (
    <View style={styles.keyboard}>
      {keys.map((keysRow, idx) => (
        <View key={idx} style={styles.keyboardRow}>
          {keysRow.map((key) => {
            const checkedLetter = checkedLetters.find((checkedLetter) => checkedLetter.letter === key);
            const isCorrect = checkedLetter?.status === checkedLetterStatus.Enum.correct;
            const isInvalid = checkedLetter?.status === checkedLetterStatus.Enum.invalid;
            const isMisplaced = checkedLetter?.status === checkedLetterStatus.Enum.misplaced;
            const isSpecialCharacter = key.startsWith('{') && key.endsWith('}');

            return (
              <Pressable
                key={key}
                onPress={isDisabled ? undefined : () => onKeyPress(key)}
                style={({ pressed }) =>
                  styles.keyContainer({
                    pressed,
                    isCorrect,
                    isInvalid,
                    isMisplaced,
                    isSpecialCharacter,
                  })
                }
                testID={`keyboard-key--${key}`}
              >
                <Text
                  allowFontScaling={false}
                  style={styles.keyText({ isInvalid, isMisplaced, isCorrect })}
                  weight="bold"
                >
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
    isSpecialCharacter,
  }: {
    pressed: boolean;
    isInvalid: boolean;
    isMisplaced: boolean;
    isCorrect: boolean;
    isSpecialCharacter: boolean;
  }) => ({
    backgroundColor: isCorrect
      ? theme.colors.petka.green
      : isMisplaced
        ? theme.colors.petka.yellow
        : isInvalid
          ? theme.colors.grey[70]
          : theme.colors.grey[20],
    opacity: pressed ? 0.4 : 1,
    flexGrow: isSpecialCharacter ? 4 : 1,
    height: 64,
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
