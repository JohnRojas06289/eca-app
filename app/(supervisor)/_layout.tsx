import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

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
