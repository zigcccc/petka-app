import { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';
import { type CheckedLetter, checkedLetterStatus } from '@/convex/puzzleGuessAttempts/models';
import { gameplayKeyboardType, useGameplaySettings } from '@/hooks/useGameplaySettings';

import { abcdKeys, type KeyboardKey as KeyboardKeyType, keysToIconMap, qwertyKeys } from './Keyboard.constants';

type Props = {
  onKeyPress: (key: KeyboardKeyType) => void;
  checkedLetters?: CheckedLetter[];
  isDisabled: boolean;
};

export function Keyboard({ isDisabled, onKeyPress, checkedLetters = [] }: Readonly<Props>) {
  const { keyboardType } = useGameplaySettings();

  const keys = useMemo(() => {
    return keyboardType === gameplayKeyboardType.enum.qwerty ? qwertyKeys : abcdKeys;
  }, [keyboardType]);

  return (
    <View style={styles.keyboard}>
      {keys.map((keysRow, idx) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Fine with it here
        <View key={idx} style={styles.keyboardRow}>
          {keysRow.map((key) => {
            const checkedLetter = checkedLetters.find((checkedLetter) => checkedLetter.letter === key);
            const isCorrect = checkedLetter?.status === checkedLetterStatus.enum.correct;
            const isInvalid = checkedLetter?.status === checkedLetterStatus.enum.invalid;
            const isMisplaced = checkedLetter?.status === checkedLetterStatus.enum.misplaced;
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
                  style={styles.keyText({ isInvalid, isMisplaced, isCorrect, isSpecialCharacter })}
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

const styles = StyleSheet.create((theme, rt) => ({
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
  }) => {
    const invalidColor = rt.themeName === 'dark' ? theme.colors.grey[10] : theme.colors.grey[70];

    return {
      backgroundColor: isCorrect
        ? theme.colors.petka.green
        : isMisplaced
          ? theme.colors.petka.yellow
          : isInvalid
            ? invalidColor
            : theme.colors.grey[20],
      opacity: pressed ? 0.4 : 1,
      flexGrow: isSpecialCharacter ? 4 : 1,
      height: 64,
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
    };
  },
  keyText: ({
    isCorrect,
    isInvalid,
    isMisplaced,
    isSpecialCharacter,
  }: {
    isInvalid: boolean;
    isMisplaced: boolean;
    isCorrect: boolean;
    isSpecialCharacter: boolean;
  }) => ({
    textTransform: 'uppercase',
    width: 22,
    textAlign: 'center',
    marginTop: isSpecialCharacter ? theme.spacing[2] : 0,
    color: isInvalid || isMisplaced || isCorrect ? theme.colors.white : theme.colors.foreground,
  }),
}));
