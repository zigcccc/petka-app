import { Octicons } from '@expo/vector-icons';
import { type PropsWithChildren, type ReactNode } from 'react';
import { View } from 'react-native';
import { StyleSheet, withUnistyles, type UnistylesVariants } from 'react-native-unistyles';

import { Text } from '../Text';

type Props = PropsWithChildren<{
  actions?: ReactNode;
  title: string;
}> &
  UnistylesVariants<typeof styles>;

const UniIcon = withUnistyles(Octicons);

export function Hint({ actions, children, intent = 'warning', title }: Props) {
  styles.useVariants({ intent });

  return (
    <View style={styles.hint}>
      <View style={styles.hintHeader}>
        <UniIcon
          name="info"
          size={14}
          testID="hint--icon"
          uniProps={(theme) => {
            const intentToIconColorMap = new Map([
              ['warning', theme.colors.gold[40]],
              ['info', theme.colors.blue[40]],
              ['success', theme.colors.green[40]],
              ['danger', theme.colors.red[40]],
            ]);
            return {
              color: intentToIconColorMap.get(intent),
            };
          }}
        />
        <Text numberOfLines={1} size="sm" style={styles.hintTitle} weight="bold">
          {title}
        </Text>
      </View>
      <View style={styles.hintBody}>{children}</View>
      {!!actions && <View style={styles.actionsContainer}>{actions}</View>}
    </View>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  hint: {
    padding: theme.spacing[3],
    borderRadius: 8,
    variants: {
      intent: {
        info: {
          backgroundColor: rt.themeName === 'dark' ? theme.colors.grey[10] : theme.colors.blue[5],
        },
        danger: {
          backgroundColor: rt.themeName === 'dark' ? theme.colors.grey[10] : theme.colors.red[0],
        },
        warning: {
          backgroundColor: rt.themeName === 'dark' ? theme.colors.grey[10] : theme.colors.gold[5],
        },
        success: {
          backgroundColor: rt.themeName === 'dark' ? theme.colors.grey[10] : theme.colors.green[0],
        },
      },
    },
  },
  hintHeader: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    alignItems: 'center',
    maxWidth: '95%',
  },
  hintTitle: {
    variants: {
      intent: {
        info: {
          color: theme.colors.blue[40],
        },
        danger: {
          color: theme.colors.red[40],
        },
        warning: {
          color: theme.colors.gold[40],
        },
        success: {
          color: theme.colors.green[40],
        },
      },
    },
  },
  hintBody: {
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[1],
  },
  actionsContainer: {
    paddingTop: theme.spacing[3],
  },
}));
