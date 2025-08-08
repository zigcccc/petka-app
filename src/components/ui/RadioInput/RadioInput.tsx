import { Octicons } from '@expo/vector-icons';
import { Children, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '../Text';

import { RadioInputContext, useRadioInputContext } from './RadioInput.context';
import { type RadioInputItemProps, type RadioInputProps } from './RadioInput.types';

export function RadioInput<Value extends string>({
  children,
  onChange,
  style,
  value,
}: Readonly<RadioInputProps<Value>>) {
  const numOfItems = Children.count(children);

  const contextValue = useMemo(() => ({ onChange, value }) as const, [onChange, value]);

  return (
    <RadioInputContext.Provider value={contextValue}>
      <View style={[radioStyles.container, style]}>
        {Children.map(children, (child, idx) => (
          <>
            {child}
            {idx + 1 !== numOfItems && <View style={radioStyles.separator} testID={`radio-input-separator--${idx}`} />}
          </>
        ))}
      </View>
    </RadioInputContext.Provider>
  );
}

function RadioInputItem({ label, value }: Readonly<RadioInputItemProps>) {
  const context = useRadioInputContext();

  const isSelected = value === context.value;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      accessible
      onPress={() => context.onChange(value)}
      role="radio"
      style={radioItemStyles.container}
    >
      {isSelected && <Octicons name="check" size={16} testID="radio-input--item--check-icon" />}
      <Text size="sm" weight={isSelected ? 'semibold' : 'regular'}>
        {label}
      </Text>
    </Pressable>
  );
}

RadioInput.Item = RadioInputItem;

const radioStyles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing[4],
  },
  separator: {
    backgroundColor: theme.colors.grey[20],
    width: '100%',
    height: StyleSheet.hairlineWidth,
  },
}));

const radioItemStyles = StyleSheet.create((theme) => ({
  container({ pressed }: { pressed: boolean }) {
    return {
      alignItems: 'center',
      flexDirection: 'row',
      gap: theme.spacing[3],
      opacity: pressed ? 0.4 : 1,
    };
  },
}));
