import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/src/theme/theme';
import { isWeb, webLayout } from '@/src/theme/responsive';

/**
 * Layout del flujo de autenticación.
 * Todas las pantallas son un Stack sin header (cada pantalla
 * implementa su propio header o flecha de regreso).
 *
 * Pantallas incluidas:
 *   index           → Login principal
 *   register        → Registro de usuario nuevo
 *   forgot-password → Recuperar contraseña (paso 1: ingresar cédula)
 *   verify-code     → Verificar código SMS (paso 2)
 *   new-password    → Nueva contraseña (paso 3)
 *   verified        → Identidad verificada (éxito de verificación)
 *   success         → Cuenta creada con éxito
 */
export default function AuthLayout() {
  return (
    <View style={[styles.shell, isWeb && styles.shellWeb]}>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="verify-code" />
        <Stack.Screen name="new-password" />
        <Stack.Screen name="verified" />
        <Stack.Screen name="success" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  shellWeb: {
    width: '100%',
    maxWidth: webLayout.authMaxWidth,
    alignSelf: 'center',
  },
});
