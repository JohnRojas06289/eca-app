import { Platform, ViewStyle } from 'react-native';

export const isWeb = Platform.OS === 'web';

export const webLayout = {
  appMaxWidth: 1440,
  contentMaxWidth: 1180,
  authMaxWidth: 560,
  sidebarWidth: 92,
} as const;

export function webOnly<T extends ViewStyle>(style: T): T | undefined {
  return isWeb ? style : undefined;
}
