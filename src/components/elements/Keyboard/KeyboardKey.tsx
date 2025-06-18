import { useState } from 'react';
import { type LayoutRectangle, Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/components/ui';

import { type KeyboardKey as KeyboardKeyType, keysToIconMap, specialKeysPairingMap } from './Keyboard.constants';

type Props = {
  onKeyPress: (value: KeyboardKeyType) => void;
  charBubble: KeyboardKeyType | null;
  value: KeyboardKeyType;
  onSetCharBubble: (value: KeyboardKeyType | null) => void;
};

export function KeyboardKey({ charBubble, onKeyPress, onSetCharBubble, value }: Props) {
  const [keyLayout, setKeyLayout] = useState<LayoutRectangle | null>(null);

  const isInactive = !!charBubble && charBubble !== value;
  const isActive = !!charBubble && charBubble === value;

  const handleKeyLongPress = () => {
    if (specialKeysPairingMap.has(value)) {
      onSetCharBubble(value);
    }
  };

  const handleCharBubblePress = () => {
    onKeyPress(specialKeysPairingMap.get(value)!);
    onSetCharBubble(null);
  };

  const handleKeyPress = () => {
    if (isInactive) {
      onSetCharBubble(null);
    } else {
      onKeyPress(value);
    }
  };

  return (
    <>
      <Pressable
        onLayout={(evt) => setKeyLayout(evt.nativeEvent.layout)}
        onLongPress={handleKeyLongPress}
        onPress={handleKeyPress}
        pressRetentionOffset={{ top: 72, bottom: 30, left: 20, right: 20 }}
        style={styles.keyContainer}
      >
        {({ pressed }) => (
          <View style={styles.keyBg({ pressed: pressed || isActive, isInactive })}>
            <Text style={styles.keyText({ isIcon: keysToIconMap.has(value) })} weight="bold">
              {keysToIconMap.get(value) ?? value}
            </Text>
          </View>
        )}
      </Pressable>
      {charBubble === value && (
        <Pressable
          onPress={handleCharBubblePress}
          style={({ pressed }) => [styles.charBubble, { left: (keyLayout?.x ?? 0) - 4, opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.keyText({ isIcon: false })} weight="bold">
            {specialKeysPairingMap.get(value)}
          </Text>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  keyContainer: {
    height: 72,
    flexGrow: 1,
  },
  keyBg: ({ pressed, isInactive }: { pressed: boolean; isInactive: boolean }) => ({
    backgroundColor: theme.colors.grey[20],
    opacity: pressed ? 0.4 : isInactive ? 0.2 : 1,
    flexGrow: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: isInactive ? -1 : 1,
  }),
  keyText: ({ isIcon }: { isIcon: boolean }) => ({
    textTransform: 'uppercase',
    width: isIcon ? 'auto' : 16,
    textAlign: 'center',
  }),
  charBubble: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: theme.colors.white,
    minWidth: 48,
    height: 72,
    top: -56,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 12px 4px rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
}));
