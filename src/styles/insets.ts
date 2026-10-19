import type { UnistylesMiniRuntime } from 'react-native-unistyles';

/**
 * Horizontal padding that also clears the left/right safe-area insets (e.g. the iPhone Duo's side column or
 * landscape cutouts). A ScrollView's `contentInsetAdjustmentBehavior` only adjusts the scrolling axis, so
 * horizontal insets have to be applied manually.
 *
 * Pass `rt.insets` (not `rt`): the Unistyles babel plugin only registers the insets dependency, and so only
 * recomputes the style when insets change, if it sees the `rt.insets` access in the stylesheet itself.
 */
export function horizontalSafePadding(insets: Pick<UnistylesMiniRuntime['insets'], 'left' | 'right'>, padding: number) {
  return {
    paddingLeft: padding + insets.left,
    paddingRight: padding + insets.right,
  };
}
