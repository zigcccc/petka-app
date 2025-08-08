import { type PropsWithChildren } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';

export type RadioInputProps<Value extends string> = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  onChange: (newValue: Value) => void;
  value?: Value;
}>;

export type RadioInputItemProps = {
  value: string;
  label: string;
};

export type RadioInputContextProps<Value extends string = any> = Pick<RadioInputProps<Value>, 'value' | 'onChange'>;
