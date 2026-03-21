import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

/**
 * Layout de tabs para el rol CIUDADANO.
 *
 * Tabs:
 *   index      → Inicio (Portal Ciudadano con servicios y educación)
 *   routes     → Rutas  (Mapa de rutas de recolección cercanas)
 *   weighings  → Pesajes (Histórico de pesajes propios)
 *   profile    → Perfil  (Datos personales, configuración)
 *
 * Pantallas adicionales fuera de tabs (sin href en tab bar):
 *   recycle-guide   → Guía de Reciclaje
 *   pqrs            → Radicar PQRS
 *   schedule        → Configurar Horarios de Recolección
 *   support         → Contacto con Soporte
 *   help            → Centro de Ayuda / FAQ
 */
export default function CitizenLayout() {
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
        name="routes"
        options={{
          title: 'Rutas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weighings"
        options={{
          title: 'Pesajes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scale-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Pantallas de detalle sin tab propio */}
      <Tabs.Screen name="recycle-guide" options={{ href: null }} />
      <Tabs.Screen name="pqrs" options={{ href: null }} />
      <Tabs.Screen name="schedule" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
    </Tabs>
  );
}
