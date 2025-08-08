/* eslint-disable @typescript-eslint/no-require-imports */
import { type PropsWithChildren } from 'react';
import { Text as MockText } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('burnt', () => ({
  toast: jest.fn(),
  alert: jest.fn(),
}));

jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  isRunningInExpoGo: jest.fn().mockReturnValue(false),
}));

jest.mock('@expo/vector-icons', () => ({
  ...jest.requireActual('@expo/vector-icons'),
  Octicons: (props: PropsWithChildren) => <MockText {...props} />,
}));

jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  ...require('@gorhom/bottom-sheet/mock'),
  ...require('./src/tests/mocks/bottomsheet'),
}));
