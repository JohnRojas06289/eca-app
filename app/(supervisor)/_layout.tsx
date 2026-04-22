import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions } from 'react-native';
import { createTabScreenOptions } from '@/src/theme/navigation';

/**
 * Layout de tabs para el rol SUPERVISOR.
 *
 * Solo puede ver métricas — sin acceso a usuarios, pesajes ni configuración.
 *
 * Tabs:
 *   index   → KPIs generales
 *   reports → Comparativo compra/venta
 */
export default function SupervisorLayout() {
  const { width } = useWindowDimensions();
  const useDesktopRail = Platform.OS === 'web' && width >= 900;

  return (
    <Tabs
      screenOptions={createTabScreenOptions(useDesktopRail)}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Métricas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Compras/Ventas',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'swap-vertical' : 'swap-vertical-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
