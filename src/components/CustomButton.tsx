import React, { useState } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { theme } from '@/src/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CustomButtonProps extends Omit<TouchableOpacityProps, 'style' | 'onPress'> {
  /** Texto del botón */
  label: string;
  onPress: () => void;
  /** primary = verde sólido (por defecto) | secondary = borde verde | ghost = solo texto */
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  /** Ícono a la izquierda del texto (cualquier ReactNode, p.ej. <Ionicons />) */
  leftIcon?: React.ReactNode;
  /** Ícono a la derecha del texto */
  rightIcon?: React.ReactNode;
  /** true por defecto — ocupa el 100% del ancho del padre */
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}

/**
 * Botón principal del Design System ZipaRecicla.
 *
 * Uso típico:
 *   <CustomButton label="Ingresar" onPress={handleLogin} />
 *   <CustomButton label="Cancelar" variant="ghost" onPress={cancel} />
 *   <CustomButton label="Enviando..." loading onPress={() => {}} />
 *   <CustomButton
 *     label="Registrar Pesaje"
 *     leftIcon={<Ionicons name="scale-outline" size={20} color="#fff" />}
 *     onPress={save}
 *   />
 */
export function CustomButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = true,
  style,
  textStyle,
  accessibilityHint,
  accessibilityLabel,
  ...touchableProps
}: CustomButtonProps) {
  const isDisabled = disabled || loading;
  const [isFocused, setIsFocused] = useState(false);
  const webButtonStyle =
    Platform.OS === 'web'
      ? ({ cursor: 'pointer', transitionDuration: '160ms' } as any)
      : undefined;

  return (
    <TouchableOpacity
      {...touchableProps}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onFocus={(event) => {
        setIsFocused(true);
        touchableProps.onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        touchableProps.onBlur?.(event);
      }}
      style={[
        styles.base,
        webButtonStyle,
        sizeStyles[size],
        variantStyles[variant],
        isFocused && styles.focused,
        isDisabled && styles.disabled,
        variant === 'secondary' && isDisabled && styles.disabledBorder,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'danger' || variant === 'success'
              ? theme.colors.textOnPrimary
              : theme.colors.primary
          }
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon != null && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              variantTextStyles[variant],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {label}
          </Text>
          {rightIcon != null && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Estilos por tamaño ──────────────────────────────────────────────────────

const sizeStyles = StyleSheet.create({
  sm: {
    height: theme.sizes.buttonHeightSm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  md: {
    height: theme.sizes.buttonHeightMd,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  lg: {
    height: theme.sizes.buttonHeight,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.lg,
  },
});

// ── Estilos por variante (contenedor) ───────────────────────────────────────

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.sm, // Sombra más sutil y funcional
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  ghost: {
    backgroundColor: theme.colors.transparent,
  },
  danger: {
    backgroundColor: theme.colors.error,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
});

// ── Estilos de texto por variante ───────────────────────────────────────────

const variantTextStyles = StyleSheet.create({
  primary: { color: theme.colors.textOnPrimary },
  secondary: { color: theme.colors.primary },
  ghost: { color: theme.colors.primary },
  danger: { color: theme.colors.textOnPrimary },
  success: { color: theme.colors.textOnPrimary },
});

// ── Tamaño de texto por tamaño de botón ─────────────────────────────────────

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: theme.typography.sizes.small },
  md: { fontSize: theme.typography.sizes.body },
  lg: { fontSize: theme.typography.sizes.h4 },
});

// ── Estilos base ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  focused: {
    borderWidth: 2,
    borderColor: theme.colors.borderFocus,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  disabled: {
    backgroundColor: theme.colors.disabled,
  },
  disabledBorder: {
    borderColor: theme.colors.disabled,
  },
  text: {
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  textDisabled: {
    color: theme.colors.disabledText,
  },
});
