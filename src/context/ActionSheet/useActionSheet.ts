import { useContext } from 'react';

import { ActionSheetContext } from './ActionSheet.context';

export function useActionSheet() {
  const actionSheetContext = useContext(ActionSheetContext);

  if (!actionSheetContext) {
    throw new Error('useActionSheet() must be used within <ActionSheetProvider />');
  }

  return actionSheetContext;
}
