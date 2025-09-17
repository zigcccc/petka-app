import { Platform } from 'react-native';

export function getOsMajorVersion() {
  try {
    return typeof Platform.Version === 'string'
      ? parseInt(Platform.Version.split('.').at(0) ?? '0', 10)
      : Platform.Version;
  } catch {
    return 0;
  }
}
