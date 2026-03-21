import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

interface CustomInputProps extends TextInputProps {
  /** Label visible sobre el input (ej: "Número de Cédula") */
  label?: string;
  /** Nombre de ícono Ionicons para el lado izquierdo */
  leftIcon?: keyof typeof Ionicons.glyphMap;
  /** Nombre de ícono Ionicons para el lado derecho (no usar junto con isPassword) */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  /** Mensaje de error mostrado debajo del input en rojo */
  error?: string;
  /** Texto de ayuda mostrado debajo del input en gris */
  hint?: string;
  /** Si true, agrega el ojo para mostrar/ocultar contraseña automáticamente */
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

/**
 * Input de texto del Design System ZipaRecicla.
 *
 * Uso típico:
 *   <CustomInput
 *     label="Número de Identificación"
 *     leftIcon="id-card-outline"
 *     placeholder="Ingrese su ID"
 *     value={id}
 *     onChangeText={setId}
 *   />
 *   <CustomInput
 *     label="Contraseña"
 *     leftIcon="lock-closed-outline"
 *     isPassword
 *     value={pass}
 *     onChangeText={setPass}
 *     error={errors.password}
 *   />
 */
export function CustomInput({
  label,
  leftIcon,
  rightIcon,
  onRightIconPress,
  error,
  hint,
  isPassword = false,
  containerStyle,
  ...inputProps
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const secureEntry = isPassword && !isPasswordVisible;
  const hasError = Boolean(error);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label != null && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          hasError && styles.inputError,
        ]}
      >
        {leftIcon != null && (
          <Ionicons
            name={leftIcon}
            size={theme.sizes.iconMd}
            color={isFocused ? theme.colors.primary : theme.colors.textMuted}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          {...inputProps}
          secureTextEntry={secureEntry}
          style={styles.input}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
        />

        {/* Botón de visibilidad de contraseña */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible((v) => !v)}
            style={styles.rightIconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={theme.sizes.iconMd}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}

        {/* Ícono derecho personalizado (sin contraseña) */}
        {!isPassword && rightIcon != null && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconBtn}
            disabled={onRightIconPress == null}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={rightIcon}
              size={theme.sizes.iconMd}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {hasError && <Text style={styles.errorText}>{error}</Text>}
      {!hasError && hint != null && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: theme.sizes.inputHeight,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
  },
  inputFocused: {
    borderColor: theme.colors.borderFocus,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  rightIconBtn: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  hintText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});
