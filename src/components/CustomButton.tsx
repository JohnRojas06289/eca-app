import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { theme } from '@/src/theme/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CustomButtonProps {
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
}: CustomButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
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
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.pill,
  },
  md: {
    height: theme.sizes.buttonHeightMd,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.pill,
  },
  lg: {
    height: theme.sizes.buttonHeight,
    paddingHorizontal: theme.spacing.xxl,
    borderRadius: theme.radius.pill,
  },
});

// ── Estilos por variante (contenedor) ───────────────────────────────────────

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.transparent,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
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
