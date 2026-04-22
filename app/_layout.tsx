import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '@/src/hooks/useAuth';
import { UsersProvider } from '@/src/context/UsersContext';
import { theme } from '@/src/theme/theme';
import { ChatBot } from '@/src/components/ChatBot';
import { isWeb, webLayout } from '@/src/theme/responsive';

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
  return (
    <AuthProvider>
      <UsersProvider>
        <RootNavigator />
      </UsersProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
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
      currentGroup === '(admin)'   ||
      currentGroup === '(supervisor)';

    if (!user) {
      // No autenticado: forzar a pantalla de login
      if (!inAuthGroup) {
        router.replace('/(auth)');
      }
      return;
    }

    // Autenticado: redirigir al grupo de su rol si no está ya ahí
    const roleToGroup: Record<string, '/(citizen)' | '/(recycler)' | '/(admin)' | '/(supervisor)'> = {
      citizen:    '/(citizen)',
      recycler:   '/(recycler)',
      admin:      '/(admin)',
      supervisor: '/(supervisor)',
    };

    const targetGroup = roleToGroup[user.role];
    const expectedSegment = `(${user.role})`;

    if (!targetGroup) return;

    if (inAuthGroup || (inRoleGroup && currentGroup !== expectedSegment)) {
      router.replace(targetGroup as any);
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
    <View style={[styles.root, isWeb && styles.rootWeb]}>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        {/* Grupo de autenticación (Login, Registro, Recuperar contraseña) */}
        <Stack.Screen name="(auth)" />

        {/* Grupos por rol */}
        <Stack.Screen name="(citizen)" />
        <Stack.Screen name="(recycler)" />
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="(supervisor)" />
      </Stack>

      {/* Chatbot flotante — visible en todas las pantallas autenticadas */}
      <ChatBot />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  rootWeb: {
    width: '100%',
    maxWidth: webLayout.appMaxWidth,
    minHeight: '100vh' as any,
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
