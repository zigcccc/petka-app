import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { type ComponentRef, type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, type AlertButton, Platform, useWindowDimensions, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button, Text, TextInput } from '@/components/ui';

import { PromptContext } from './Prompt.context';

export function PromptProvider({ children }: Readonly<PropsWithChildren>) {
  const { height } = useWindowDimensions();
  const [promptHeight, setPromptHeight] = useState(0);
  const [promptTitle, setPromptTitle] = useState('');
  const [promptMessage, setPromptMessage] = useState('');
  const [promptButtons, setPromptButtons] = useState<AlertButton[]>([]);
  const ref = useRef<ComponentRef<typeof BottomSheetModal>>(null);
  const { control, getValues, reset } = useForm({ defaultValues: { promptInput: '' } });

  const isAndroid = Platform.OS === 'android';

  const handlePrompt = useCallback(
    (title: string, message: string = '', buttons: AlertButton[] = []) => {
      if (isAndroid) {
        setPromptTitle(title);
        setPromptMessage(message);
        setPromptButtons(buttons);
        ref.current?.present();
      } else {
        Alert.prompt(title, message, buttons);
      }
    },
    [isAndroid]
  );

  const handleDismiss = useCallback(() => {
    setPromptButtons([]);
    setPromptTitle('');
    setPromptMessage('');
    reset({ promptInput: '' });
  }, [reset]);

  const contextValue = useMemo(() => ({ prompt: handlePrompt }), [handlePrompt]);

  if (!isAndroid) {
    return <PromptContext.Provider value={contextValue}>{children}</PromptContext.Provider>;
  }

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
      <BottomSheetModal
        ref={ref}
        accessibilityLabel="Prompt alert"
        accessibilityRole="alert"
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        bottomInset={height / 2 - promptHeight}
        detached={true}
        handleComponent={null}
        onDismiss={handleDismiss}
        style={{ marginHorizontal: 24 }}
      >
        <BottomSheetView
          onLayout={({ nativeEvent: { layout } }) => setPromptHeight(layout.height / 2)}
          style={styles.container}
        >
          <View style={styles.contentContainer}>
            <Text weight="bold">{promptTitle}</Text>
            {promptMessage && (
              <Text color="grey70" size="sm">
                {promptMessage}
              </Text>
            )}
            <Controller
              control={control}
              name="promptInput"
              render={({ field: { onChange, ...field } }) => (
                <TextInput
                  {...field}
                  autoFocus={true}
                  onChangeText={onChange}
                  style={styles.input}
                  testID="prompt-input"
                />
              )}
            />
          </View>
          <View style={styles.buttonsContainer}>
            {promptButtons.map((button, idx) => (
              <Button
                key={`${button.text}-${idx}`}
                intent={button.style === 'destructive' ? 'danger' : button.isPreferred ? 'terciary' : 'shaded'}
                onPress={
                  button.style === 'cancel'
                    ? () => ref.current?.dismiss()
                    : () => {
                        button.onPress?.(getValues().promptInput);
                        ref.current?.dismiss();
                      }
                }
                style={styles.button(idx)}
                variant="transparent"
              >
                {button.text}
              </Button>
            ))}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </PromptContext.Provider>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    borderRadius: 4,
  },
  contentContainer: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[4],
  },
  input: {
    marginTop: theme.spacing[3],
  },
  buttonsContainer: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grey[50],
  },
  button(idx: number) {
    return {
      flex: 1,
      borderLeftWidth: Math.min(idx, StyleSheet.hairlineWidth),
      borderLeftColor: theme.colors.grey[50],
      borderRadius: 0,
    };
  },
}));
