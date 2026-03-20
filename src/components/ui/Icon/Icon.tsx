import type { LucideIcon } from 'lucide-react-native';
import type { ComponentProps } from 'react';
import { withUnistyles } from 'react-native-unistyles';

function LucideIconWrapper({
  icon: IconComponent,
  ...props
}: ComponentProps<LucideIcon> & { icon: LucideIcon; testID?: string }) {
  return <IconComponent {...props} />;
}

export const Icon = withUnistyles(LucideIconWrapper);
export type IconProps = ComponentProps<typeof Icon>;
