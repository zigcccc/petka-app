import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { type ComponentRef, type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { ActionSheetIOS, type ActionSheetIOSOptions, ActivityIndicator, Platform, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Text } from '@/components/ui';

import { ActionSheetContext } from './ActionSheet.context';
import { type ActionSheetPressCallback } from './ActionSheet.types';

export function ActionSheetProvider({ children }: Readonly<PropsWithChildren>) {
  const ref = useRef<ComponentRef<typeof BottomSheetModal>>(null);
  const [config, setConfig] = useState<ActionSheetIOSOptions | null>(null);
  const actionCallbackRef = useRef<ActionSheetPressCallback | null>(null);

  const isAndroid = Platform.OS === 'android';

  const handlePresentActionSheet = useCallback(
    (options: ActionSheetIOSOptions, onActionPress: ActionSheetPressCallback) => {
      if (isAndroid) {
        setConfig(options);
        actionCallbackRef.current = onActionPress;
        ref.current?.present();
      } else {
        ActionSheetIOS.showActionSheetWithOptions(options, onActionPress);
      }
    },
    [ref, isAndroid]
  );

  const handleDismiss = () => {
    setConfig(null);
    actionCallbackRef.current = null;
  };

  const contextValues = useMemo(() => ({ present: handlePresentActionSheet }), [handlePresentActionSheet]);

  if (!isAndroid) {
    return <ActionSheetContext.Provider value={contextValues}>{children}</ActionSheetContext.Provider>;
  }

  return (
    <ActionSheetContext.Provider value={contextValues}>
      {children}

      <BottomSheetModal
        ref={ref}
        accessibilityLabel="Action sheet with options"
        accessibilityRole="menu"
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        backgroundStyle={styles.background}
        handleComponent={null}
        onDismiss={handleDismiss}
      >
        <BottomSheetView style={styles.container}>
          {!config || !actionCallbackRef.current ? (
            <BottomSheetView style={styles.loadingContainer}>
              <View style={styles.loadingBackground}>
                <ActivityIndicator size="large" />
              </View>
            </BottomSheetView>
          ) : (
            <>
              <View style={styles.actionsContainer}>
                <View style={styles.headerContainer}>
                  <Text align="center" color="grey70" size="sm" weight="bold">
                    {config.title}
                  </Text>
                  <Text align="center" color="grey70" size="sm">
                    {config.message}
                  </Text>
                </View>
                {config.options.map((actionText, idx) => {
                  if (idx === config.cancelButtonIndex) {
                    return null;
                  }

                  return (
                    <View key={`${actionText}-${idx}`} style={styles.actionButtonContainer}>
                      <Button
                        disabled={config.disabledButtonIndices?.includes(idx)}
                        intent={idx === config.destructiveButtonIndex ? 'danger' : 'shaded'}
                        onPress={() => {
                          actionCallbackRef.current?.(idx);
                          ref.current?.dismiss();
                        }}
                        size="lg"
                        variant="transparent"
                      >
                        {actionText}
                      </Button>
                    </View>
                  );
                })}
              </View>
              {config.cancelButtonIndex !== undefined && config.options[config.cancelButtonIndex] && (
                <View style={styles.cancelButtonContainer}>
                  <Button intent="shaded" onPress={() => ref.current?.dismiss()} size="lg" variant="transparent">
                    {config.options[config.cancelButtonIndex]}
                  </Button>
                </View>
              )}
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </ActionSheetContext.Provider>
  );
}

const styles = StyleSheet.create((theme, rt) => ({
  background: {
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing[3],
    paddingBottom: rt.insets.bottom,
  },
  loadingBackground: {
    paddingVertical: 125,
    borderRadius: 12,
    backgroundColor: theme.colors.grey[10],
  },
  container: {
    flex: 1,
    paddingBottom: rt.insets.bottom,
    paddingHorizontal: theme.spacing[3],
  },
  headerContainer: {
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[6],
  },
  actionsContainer: {
    marginTop: theme.spacing[6],
    marginBottom: theme.spacing[4],
    backgroundColor: theme.colors.grey[10],
    borderRadius: 12,
  },
  actionButtonContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grey[50],
  },
  cancelButtonContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
  },
}));
