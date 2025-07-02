import * as toaster from 'burnt';

type ToastOptions = {
  message?: string;
  from?: 'top' | 'bottom';
  intent?: 'success' | 'warning' | 'error' | 'none';
};

const intentToPresetMap = new Map<ToastOptions['intent'], 'error' | 'done' | 'none'>([
  ['success', 'done'],
  ['error', 'error'],
  ['warning', 'error'],
  ['none', 'none'],
]);

export function useToaster() {
  const toast = async (title: string, options: ToastOptions = {}) => {
    const intent = options.intent ?? 'none';

    await toaster.toast({
      title,
      message: options.message,
      haptic: intent,
      preset: intentToPresetMap.get(intent),
      from: options.from ?? 'top',
    });
  };

  return { toast } as const;
}
