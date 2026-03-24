import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

/**
 * Layout de tabs para el rol RECICLADOR (Reutilizador).
 *
 * Tabs (5 tabs como se ve en pantalla "Gestión de Rutas"):
 *   index      → Inicio     (Dashboard con impacto total, ingresos, ruta actual)
 *   routes     → Rutas      (Gestión de ruta activa, próximas paradas)
 *   weighings  → Pesajes    (Nuevo pesaje + histórico)
 *   alerts     → Alertas    (Notificaciones de ruta, incidencias)
 *   profile    → Perfil     (Datos, impacto ambiental, configuración)
 *
 * Pantallas adicionales fuera de tabs:
 *   new-weighing      → Nuevo Registro de Pesaje (formulario)
 *   weighing-station  → Estación de Pesaje (báscula en tiempo real)
 *   report-incident   → Reportar Incidencia en Ruta
 *   prices            → Lista de Precios de Materiales
 */
export default function RecyclerLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 2,
          borderTopColor: theme.colors.separator,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
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
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routes"
        options={{
          title: 'Rutas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weighings"
        options={{
          title: 'Pesajes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'scale' : 'scale-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
          ),
        }}
      />

      {/* Pantallas de detalle sin tab propio */}
      <Tabs.Screen name="new-weighing" options={{ href: null }} />
      <Tabs.Screen name="weighing-station" options={{ href: null }} />
      <Tabs.Screen name="report-incident" options={{ href: null }} />
      <Tabs.Screen name="prices" options={{ href: null }} />
      <Tabs.Screen name="validate" options={{ href: null }} />
    </Tabs>
  );
}
