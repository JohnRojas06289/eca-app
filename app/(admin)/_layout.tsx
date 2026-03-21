import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

/**
 * Layout de tabs para el rol ADMINISTRADOR.
 *
 * Tabs (como se ve en "Panel Administrativo - General"):
 *   index    → Inicio    (Dashboard con métricas globales, alertas, operaciones)
 *   users    → Usuarios  (Gestión de usuarios: Recicladores, Operarios, Admins)
 *   reports  → Reportes  (Análisis de impacto, exportar PDF)
 *   settings → Ajustes   (Configuración general del sistema)
 *
 * Pantallas adicionales fuera de tabs:
 *   routes         → Gestión de Rutas
 *   user-detail    → Detalle de usuario
 *   impact         → Análisis de Impacto detallado
 *   validate       → Validar Pesajes pendientes
 */
export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: Platform.OS === 'ios'
            ? theme.sizes.tabBarHeightIos
            : theme.sizes.tabBarHeight,
          paddingBottom: Platform.OS === 'ios' ? 24 : theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          ...theme.shadows.md,
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.sizes.tiny,
          fontWeight: theme.typography.weights.medium,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Usuarios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Pantallas de detalle sin tab propio */}
      <Tabs.Screen name="routes" options={{ href: null }} />
      <Tabs.Screen name="user-detail" options={{ href: null }} />
      <Tabs.Screen name="impact" options={{ href: null }} />
      <Tabs.Screen name="validate" options={{ href: null }} />
    </Tabs>
  );
}
