import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

type AlertCategory = 'all' | 'route' | 'weighing' | 'system';
type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

interface AlertItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  category: Exclude<AlertCategory, 'all'>;
  severity: AlertSeverity;
  read: boolean;
}

const ALERTS: AlertItem[] = [
  {
    id: '1',
    title: 'Nueva parada asignada',
    body: 'Se agregó "Conjunto Algarra III" a tu ruta de hoy. Parada #21, Calle 8 #4-12.',
    timestamp: 'Hace 5 min',
    category: 'route',
    severity: 'info',
    read: false,
  },
  {
    id: '2',
    title: 'Pesaje confirmado',
    body: 'El pesaje de Plástico PET (12.5 kg) fue confirmado por el sistema. Valor: $10,000.',
    timestamp: 'Hace 32 min',
    category: 'weighing',
    severity: 'success',
    read: false,
  },
  {
    id: '3',
    title: 'Acceso bloqueado en ruta',
    body: 'La parada #15 "Conjunto El Salitre" reporta acceso bloqueado por obras. Replanifica tu recorrido.',
    timestamp: 'Hace 1 h',
    category: 'route',
    severity: 'warning',
    read: false,
  },
  {
    id: '4',
    title: 'Precio del aluminio actualizado',
    body: 'El precio del aluminio pasó de $2,000/kg a $2,200/kg. Tus pesajes futuros se registrarán al nuevo precio.',
    timestamp: 'Ayer, 3:00 PM',
    category: 'system',
    severity: 'info',
    read: true,
  },
  {
    id: '5',
    title: 'Ruta completada',
    body: '¡Ruta "Centro Histórico" finalizada con éxito! Recolectaste 91.1 kg en 13 paradas.',
    timestamp: 'Ayer, 1:45 PM',
    category: 'route',
    severity: 'success',
    read: true,
  },
  {
    id: '6',
    title: 'Error al sincronizar pesaje',
    body: 'El pesaje de Vidrio Transparente no se pudo sincronizar por falta de conexión. Se reintentará automáticamente.',
    timestamp: 'Hace 2 días',
    category: 'weighing',
    severity: 'error',
    read: true,
  },
];

const CATEGORIES: { key: AlertCategory; label: string }[] = [
  { key: 'all',      label: 'Todas'    },
  { key: 'route',    label: 'Rutas'    },
  { key: 'weighing', label: 'Pesajes'  },
  { key: 'system',   label: 'Sistema'  },
];

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: string; color: string; bgColor: string }> = {
  info:    { icon: 'information-circle-outline', color: theme.colors.info,    bgColor: theme.colors.infoLight    },
  warning: { icon: 'warning-outline',            color: theme.colors.warning, bgColor: theme.colors.warningLight },
  error:   { icon: 'alert-circle-outline',       color: theme.colors.error,   bgColor: theme.colors.errorLight   },
  success: { icon: 'checkmark-circle-outline',   color: theme.colors.success, bgColor: theme.colors.successLight },
};

export default function RecyclerAlertsScreen() {
  const [activeCategory, setActiveCategory] = useState<AlertCategory>('all');
  const [alerts, setAlerts] = useState<AlertItem[]>(ALERTS);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const filtered = alerts.filter(
    (a) => activeCategory === 'all' || a.category === activeCategory,
  );

  function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }

  function markRead(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a)),
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Alertas</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSubtitle}>{unreadCount} sin leer</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={markAllRead}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.markAllText}>Marcar todo leído</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filtros de categoría ───────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={theme.colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Sin alertas</Text>
            <Text style={styles.emptyBody}>No hay alertas en esta categoría.</Text>
          </View>
        ) : (
          filtered.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            return (
              <TouchableOpacity
                key={alert.id}
                style={[styles.alertCard, !alert.read && styles.alertCardUnread]}
                onPress={() => markRead(alert.id)}
                activeOpacity={0.85}
              >
                {/* Ícono de severidad */}
                <View style={[styles.alertIconBg, { backgroundColor: config.bgColor }]}>
                  <Ionicons
                    name={config.icon as any}
                    size={22}
                    color={config.color}
                  />
                </View>

                {/* Contenido */}
                <View style={styles.alertContent}>
                  <View style={styles.alertTitleRow}>
                    <Text
                      style={[
                        styles.alertTitle,
                        !alert.read && styles.alertTitleUnread,
                      ]}
                      numberOfLines={1}
                    >
                      {alert.title}
                    </Text>
                    {!alert.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.alertBody} numberOfLines={2}>
                    {alert.body}
                  </Text>
                  <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  markAllText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
    marginTop: theme.spacing.xs,
  },

  // ── Filtros ──────────────────────────────────────────────
  categoriesScroll: {
    paddingHorizontal: theme.spacing.screen,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.chipHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  categoryLabelActive: { color: theme.colors.textOnPrimary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Tarjeta de alerta ────────────────────────────────────
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  alertCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  alertIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: { flex: 1 },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  alertTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  alertTitleUnread: { fontWeight: theme.typography.weights.bold },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    flexShrink: 0,
  },
  alertBody: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.xs,
  },
  alertTimestamp: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },

  // ── Estado vacío ─────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.huge,
    gap: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  emptyBody: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
