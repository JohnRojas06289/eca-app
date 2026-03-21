import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { theme } from '@/src/theme/theme';

/**
 * Layout raíz de la app.
 *
 * Guard de autenticación:
 *   - Sin sesión → redirige a /(auth)
 *   - Ciudadano  → redirige a /(citizen)
 *   - Reciclador → redirige a /(recycler)
 *   - Admin      → redirige a /(admin)
 *
 * Mientras AsyncStorage carga, muestra un spinner en verde
 * para evitar flashes de contenido sin autenticar.
 */
export default function RootLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;

    const currentGroup = segments[0] as string | undefined;
    const inAuthGroup = currentGroup === '(auth)';
    const inRoleGroup =
      currentGroup === '(citizen)' ||
      currentGroup === '(recycler)' ||
      currentGroup === '(admin)';

    if (!user) {
      // No autenticado: forzar a pantalla de login
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
      return;
    }

    // Autenticado: redirigir al grupo de su rol si no está ya ahí
    const roleToGroup: Record<string, '/(citizen)' | '/(recycler)' | '/(admin)'> = {
      citizen: '/(citizen)',
      recycler: '/(recycler)',
      admin: '/(admin)',
    };

    const targetGroup = roleToGroup[user.role];
    const expectedSegment = `(${user.role})`;

    if (inAuthGroup || (inRoleGroup && currentGroup !== expectedSegment)) {
      router.replace(targetGroup);
    }
  }, [user, isLoading, segments]);

  // Pantalla de carga mientras se lee AsyncStorage
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      {/* Grupo de autenticación (Login, Registro, Recuperar contraseña) */}
      <Stack.Screen name="(auth)" />

      {/* Grupos por rol */}
      <Stack.Screen name="(citizen)" />
      <Stack.Screen name="(recycler)" />
      <Stack.Screen name="(admin)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
