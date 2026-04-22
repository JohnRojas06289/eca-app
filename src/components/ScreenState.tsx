import { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from './CustomButton';

type StateVariant = 'empty' | 'error' | 'loading';

interface ScreenStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onAction?: () => void;
  variant?: StateVariant;
  children?: ReactNode;
}

const variantConfig: Record<StateVariant, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  empty: { icon: 'file-tray-outline', color: theme.colors.textSecondary, bg: theme.colors.surfaceAlt },
  error: { icon: 'alert-circle-outline', color: theme.colors.error, bg: theme.colors.errorLight },
  loading: { icon: 'sync-outline', color: theme.colors.primary, bg: theme.colors.primaryLight },
};

export function ScreenState({
  title,
  description,
  actionLabel,
  icon,
  onAction,
  variant = 'empty',
  children,
}: ScreenStateProps) {
  const config = variantConfig[variant];

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
        {variant === 'loading' ? (
          <ActivityIndicator color={config.color} />
        ) : (
          <Ionicons name={icon ?? config.icon} size={24} color={config.color} />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
      {actionLabel && onAction ? (
        <CustomButton label={actionLabel} onPress={onAction} size="md" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xxxl,
    minHeight: 220,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    maxWidth: 460,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
  },
  action: {
    marginTop: theme.spacing.lg,
    alignSelf: 'center',
  },
});
