import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions } from 'react-native';
import { createTabScreenOptions } from '@/src/theme/navigation';

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
  const { width } = useWindowDimensions();
  const useDesktopRail = Platform.OS === 'web' && width >= 900;

  return (
    <Tabs
      screenOptions={createTabScreenOptions(useDesktopRail)}
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
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
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
