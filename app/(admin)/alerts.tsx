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
import { formatRelativeTime } from '@/src/utils/date';

type AlertCategory = 'all' | 'weighing' | 'route' | 'user';
type AlertSeverity = 'info' | 'warning' | 'error' | 'success';

interface AlertItem {
  id: string;
  title: string;
  body: string;
  date: Date;
  category: Exclude<AlertCategory, 'all'>;
  severity: AlertSeverity;
  read: boolean;
}

const now = new Date();
const ALERTS: AlertItem[] = [
  {
    id: '1',
    title: 'Pesaje pendiente de aprobación',
    body: '3 pesajes registrados esperan confirmación del reciclador.',
    date: new Date(now.getTime() - 10 * 60 * 1000),
    category: 'weighing',
    severity: 'warning',
    read: false,
  },
  {
    id: '2',
    title: 'Ruta bloqueada',
    body: 'La parada #15 de la ruta "Centro Histórico" reporta acceso bloqueado.',
    date: new Date(now.getTime() - 40 * 60 * 1000),
    category: 'route',
    severity: 'error',
    read: false,
  },
  {
    id: '3',
    title: 'Nuevo reciclador',
    body: 'María González completó el registro y espera aprobación.',
    date: new Date(now.getTime() - 60 * 60 * 1000),
    category: 'user',
    severity: 'info',
    read: false,
  },
];

const CATEGORIES: { key: AlertCategory; label: string }[] = [
  { key: 'all',      label: 'Todas'    },
  { key: 'weighing', label: 'Pesajes'  },
  { key: 'route',    label: 'Rutas'    },
  { key: 'user',     label: 'Usuarios' },
];

const SEVERITY_CONFIG: Record<AlertSeverity, { icon: string; color: string; bgColor: string }> = {
  info:    { icon: 'information-circle-outline', color: theme.colors.info,    bgColor: theme.colors.infoLight    },
  warning: { icon: 'warning-outline',            color: theme.colors.warning, bgColor: theme.colors.warningLight },
  error:   { icon: 'alert-circle-outline',       color: theme.colors.error,   bgColor: theme.colors.errorLight   },
  success: { icon: 'checkmark-circle-outline',   color: theme.colors.success, bgColor: theme.colors.successLight },
};

export default function AdminAlertsScreen() {
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
                  <Text style={styles.alertTimestamp}>{formatRelativeTime(alert.date)}</Text>
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
