import { Octicons } from '@expo/vector-icons';
import { type ReactNode, type PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Text } from '../Text';

type Props = PropsWithChildren<{
  title?: string;
  onShowActions?: () => void;
  actionsIconName?: keyof typeof Octicons.glyphMap;
}>;

export function Card({ actionsIconName = 'pencil', children, title, onShowActions }: Readonly<Props>) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} weight="medium">
          {title}
        </Text>
        <View style={{ flex: 1 }} />
        {!!onShowActions && (
          <Pressable
            hitSlop={12}
            onPress={onShowActions}
            style={{
              paddingHorizontal: 8,
              backgroundColor: 'white',
              transform: [{ translateX: 12 }],
            }}
            testID="card--actions-trigger"
          >
            {({ pressed }) => (
              <Octicons
                color={theme.colors.grey[50]}
                name={actionsIconName}
                size={18}
                style={{ opacity: pressed ? 0.4 : 1 }}
              />
            )}
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

function ActionRow({
  action = null,
  children,
  title,
}: Readonly<PropsWithChildren<{ action?: ReactNode; title: string }>>) {
  return (
    <View style={styles.actionRow}>
      <View style={styles.actionRowText({ hasAction: !!action })}>
        <Text color="grey70" size="sm" weight="medium">
          {title}
        </Text>
        <Text color="grey70" size="xs">
          {children}
        </Text>
      </View>
      {action}
    </View>
  );
}
Card.ActionRow = ActionRow;

const styles = StyleSheet.create((theme) => ({
  container: {
    borderWidth: 1,
    borderColor: theme.colors.grey[20],
    padding: theme.spacing[4],
    paddingTop: 0,
    borderRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ translateY: '-50%' }, { translateX: theme.spacing[2] * -1 }],
  },
  title: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[2],
  },
  content: {
    gap: theme.spacing[6],
  },
  actionRow: {
    gap: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionRowText({ hasAction }: { hasAction: boolean }) {
    return {
      flex: 1,
      maxWidth: hasAction ? '80%' : '100%',
    };
  },
}));
