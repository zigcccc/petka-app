import dayjs from 'dayjs';
import 'dayjs/locale/sl';

dayjs.locale('sl');

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

jest.mock('lucide-react-native', () => {
  const { Text } = require('react-native');
  const { defaultTheme } = jest.requireActual('./src/styles/themes');

  const createMockIcon = (name: string) => {
    // biome-ignore lint/suspicious/noExplicitAny: Test mock, fine with any
    const MockIcon = ({ testID, accessibilityLabel, color, size, uniProps, ...rest }: Record<string, any>) => {
      const transformed = uniProps ? uniProps(defaultTheme) : {};
      const resolvedColor = transformed?.color ?? color;
      return (
        <Text
          accessibilityLabel={accessibilityLabel ?? name}
          color={resolvedColor}
          size={size}
          style={resolvedColor ? { color: resolvedColor } : undefined}
          testID={testID}
          {...rest}
        />
      );
    };
    MockIcon.displayName = name;
    return MockIcon;
  };

  return new Proxy(
    {},
    {
      get(_t: unknown, prop: string) {
        return createMockIcon(prop);
      },
    }
  );
});

jest.mock('@gorhom/bottom-sheet', () => ({
  __esModule: true,
  ...require('@gorhom/bottom-sheet/mock'),
  ...require('./src/tests/mocks/bottomsheet'),
}));
