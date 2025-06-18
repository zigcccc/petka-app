import { useState } from 'react';
import { type LayoutRectangle, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
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
  const charBubbleOverlayY = useSharedValue(0);
  const [pressed, setPressed] = useState(false);
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
    charBubbleOverlayY.value = 0;
  };

  const handleKeyPress = () => {
    if (isInactive || isActive) {
      onSetCharBubble(null);
      setPressed(false);
      charBubbleOverlayY.value = 0;
    } else {
      onKeyPress(value);
    }
  };

  const tapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onBegin(() => {
      runOnJS(setPressed)(true);
    })
    .onStart(() => {
      runOnJS(handleKeyPress)();
    })
    .onEnd(() => {
      runOnJS(setPressed)(false);
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onBegin(() => runOnJS(setPressed)(true))
    .onStart(() => {
      runOnJS(handleKeyLongPress)();
    })
    .onEnd(() => {
      runOnJS(setPressed)(false);
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      charBubbleOverlayY.value = 0;
    })
    .onUpdate((e) => {
      // We're moving up!
      if (e.velocityY < 0) {
        if (charBubbleOverlayY.value < -20) {
          charBubbleOverlayY.value = withSpring(-64, { duration: 500, dampingRatio: 1 });
          e.translationY = charBubbleOverlayY.value;
        } else {
          charBubbleOverlayY.value = e.translationY;
        }
      }

      // We're moving down!
      if (e.velocityY > 0) {
        if (charBubbleOverlayY.value > -20) {
          charBubbleOverlayY.value = withSpring(0, { duration: 500, dampingRatio: 1 });
          e.translationY = charBubbleOverlayY.value;
        } else {
          charBubbleOverlayY.value = e.translationY;
        }
      }
    })
    .onEnd(() => {
      charBubbleOverlayY.value = withSpring(
        charBubbleOverlayY.value > -20 ? 0 : -64,
        { duration: 500, dampingRatio: 1 },
        (finished) => {
          if (finished) {
            if (charBubbleOverlayY.value !== 0) {
              runOnJS(handleCharBubblePress)();
            }
            runOnJS(onSetCharBubble)(null);
            runOnJS(setPressed)(false);
          }
        }
      );
    });

  const gestures = Gesture.Simultaneous(tapGesture, longPressGesture, panGesture);

  const charBubbleOverlayStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: 64 + charBubbleOverlayY.value }],
  }));

  return (
    <>
      <GestureDetector gesture={gestures}>
        <View onLayout={(evt) => setKeyLayout(evt.nativeEvent.layout)} style={styles.keyContainer}>
          <View style={styles.keyBg({ pressed: pressed || isActive, isInactive })}>
            <Text style={styles.keyText({ isIcon: keysToIconMap.has(value) })} weight="bold">
              {keysToIconMap.get(value) ?? value}
            </Text>
          </View>
        </View>
      </GestureDetector>
      {charBubble === value && (
        <View style={[styles.charBubble, { left: (keyLayout?.x ?? 0) - 4, opacity: pressed ? 0.7 : 1 }]}>
          <Animated.View style={[styles.charBubbleOverlay, charBubbleOverlayStyles]} />
          <Text style={styles.keyText({ isIcon: false })} weight="bold">
            {specialKeysPairingMap.get(value)}
          </Text>
        </View>
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
    overflow: 'hidden',
  },
  charBubbleOverlay: {
    backgroundColor: theme.colors.green[20],
    position: 'absolute',
    left: 4,
    right: 4,
    height: 64,
    borderRadius: 4,
  },
}));
