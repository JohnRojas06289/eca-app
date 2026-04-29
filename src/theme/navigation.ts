import { Platform } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { theme } from './theme';
import { isWeb, webLayout } from './responsive';

export function createTabScreenOptions(useDesktopRail = isWeb): BottomTabNavigationOptions {
  const useMobileWebTabs = isWeb && !useDesktopRail;

  return {
    headerShown: false,
    tabBarActiveTintColor: useDesktopRail ? theme.colors.primaryDark : theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarActiveBackgroundColor: useDesktopRail ? theme.colors.primaryLight : undefined,
    tabBarInactiveBackgroundColor: theme.colors.transparent,
    tabBarHideOnKeyboard: true,
    tabBarPosition: useDesktopRail ? 'left' : 'bottom',
    tabBarVariant: useDesktopRail ? 'material' : 'uikit',
    tabBarLabelPosition: 'below-icon',
    sceneStyle: {
      backgroundColor: theme.colors.background,
    },
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      ...(useDesktopRail
        ? {
            width: webLayout.sidebarWidth,
            minWidth: webLayout.sidebarWidth,
            maxWidth: webLayout.sidebarWidth,
            height: '100%',
            paddingTop: theme.spacing.xl,
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.xs,
            borderTopWidth: 0,
            borderRightWidth: 1,
            borderRightColor: theme.colors.border,
            shadowOpacity: 0,
            elevation: 0,
          }
        : {
            width: useMobileWebTabs ? '100%' : undefined,
            maxWidth: useMobileWebTabs ? '100%' : undefined,
            minWidth: useMobileWebTabs ? 0 : undefined,
            overflow: useMobileWebTabs ? 'hidden' : undefined,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'ios' ? theme.sizes.tabBarHeightIos : theme.sizes.tabBarHeight,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 6,
            ...theme.shadows.sm,
          }),
    },
    tabBarItemStyle: {
      ...(useDesktopRail
        ? {
            width: webLayout.sidebarWidth - 16,
            minHeight: 64,
            marginVertical: 4,
            borderRadius: theme.radius.xl,
            paddingVertical: theme.spacing.sm,
            paddingHorizontal: theme.spacing.xs,
            alignSelf: 'center',
          }
        : useMobileWebTabs
          ? {
              flex: 1,
              minWidth: 0,
              maxWidth: '100%',
              paddingHorizontal: 0,
            }
          : {}),
    },
    tabBarIconStyle: {
      ...(useDesktopRail
        ? {
            marginRight: 0,
            marginBottom: 2,
          }
        : {}),
    },
    tabBarLabelStyle: {
      fontSize: theme.typography.sizes.tiny,
      lineHeight: 13,
      fontWeight: useDesktopRail ? theme.typography.weights.semibold : theme.typography.weights.medium,
      textAlign: 'center',
      marginTop: useDesktopRail ? 2 : 0,
      marginBottom: useDesktopRail ? 0 : Platform.OS === 'ios' ? 0 : 2,
    },
  };
}

export const baseTabScreenOptions = createTabScreenOptions();
