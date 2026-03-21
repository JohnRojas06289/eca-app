import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { StatCard } from '@/src/components/StatCard';
import { useAuth } from '@/src/hooks/useAuth';

interface AlertRow {
  id: string;
  title: string;
  body: string;
  severity: 'warning' | 'error' | 'info';
  timestamp: string;
}

interface QuickAction {
  icon: string;
  label: string;
  route: string;
  color: string;
  bgColor: string;
}

const RECENT_ALERTS: AlertRow[] = [
  { id: '1', title: 'Pesaje sin confirmar',   body: '3 pesajes del reciclador Juan Pérez llevan más de 24 h pendientes.',  severity: 'warning', timestamp: 'Hace 10 min' },
  { id: '2', title: 'Ruta bloqueada',         body: 'La parada #15 de la ruta "Centro Histórico" reporta acceso bloqueado.', severity: 'error',   timestamp: 'Hace 40 min' },
  { id: '3', title: 'Nuevo reciclador',       body: 'María González completó el registro y espera aprobación.',              severity: 'info',    timestamp: 'Hace 1 h'   },
];

const QUICK_ACTIONS: QuickAction[] = [
  { icon: 'checkmark-done-outline',  label: 'Validar Pesajes', route: '/(admin)/validate', color: theme.colors.success, bgColor: theme.colors.successLight },
  { icon: 'map-outline',             label: 'Rutas',           route: '/(admin)/routes',   color: theme.colors.info,    bgColor: theme.colors.infoLight    },
  { icon: 'people-outline',          label: 'Usuarios',        route: '/(admin)/users',    color: theme.colors.primary, bgColor: theme.colors.primaryLight  },
  { icon: 'bar-chart-outline',       label: 'Reportes',        route: '/(admin)/reports',  color: theme.colors.warning, bgColor: theme.colors.warningLight  },
];

const SEVERITY_CONFIG = {
  warning: { icon: 'warning-outline',          color: theme.colors.warning, bgColor: theme.colors.warningLight },
  error:   { icon: 'alert-circle-outline',     color: theme.colors.error,   bgColor: theme.colors.errorLight   },
  info:    { icon: 'information-circle-outline',color: theme.colors.info,   bgColor: theme.colors.infoLight    },
};

export default function AdminHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerWelcome}>PANEL ADMINISTRATIVO</Text>
            <Text style={styles.headerName}>Hola, {firstName}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── Stats globales ────────────────────────────────── */}
        <StatCard
          variant="hero"
          label="MATERIAL TOTAL"
          value="12.450"
          unit="kg"
          trend="Este mes"
          trendDirection="up"
          style={styles.heroCard}
        />

        <View style={styles.statsRow}>
          <StatCard
            variant="compact"
            label="Recicladores"
            value="24"
            icon="people-outline"
            iconColor={theme.colors.primary}
            style={styles.statCardHalf}
          />
          <StatCard
            variant="compact"
            label="Rutas activas"
            value="6"
            icon="map-outline"
            iconColor={theme.colors.info}
            iconBgColor={theme.colors.infoLight}
            style={styles.statCardHalf}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            variant="compact"
            label="Pesajes hoy"
            value="38"
            icon="scale-outline"
            iconColor={theme.colors.warning}
            iconBgColor={theme.colors.warningLight}
            style={styles.statCardHalf}
          />
          <StatCard
            variant="compact"
            label="Pendientes"
            value="3"
            icon="time-outline"
            iconColor={theme.colors.error}
            iconBgColor={theme.colors.errorLight}
            style={styles.statCardHalf}
          />
        </View>

        {/* ── Acciones rápidas ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.route}
              style={styles.quickActionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickActionIconBg, { backgroundColor: action.bgColor }]}>
                <Ionicons name={action.icon as any} size={26} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Alertas recientes ─────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alertas Recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/reports' as any)}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {RECENT_ALERTS.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          return (
            <View key={alert.id} style={styles.alertCard}>
              <View style={[styles.alertIconBg, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon as any} size={20} color={config.color} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertBody} numberOfLines={2}>{alert.body}</Text>
                <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerWelcome: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },

  // ── Stats ────────────────────────────────────────────────
  heroCard: { marginBottom: theme.spacing.lg },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCardHalf: { flex: 1 },

  // ── Secciones ────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionLink: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Acciones rápidas ─────────────────────────────────────
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  quickActionCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  quickActionIconBg: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  // ── Alertas ──────────────────────────────────────────────
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
  alertIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertContent: { flex: 1 },
  alertTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  alertBody: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.small * theme.typography.lineHeights.normal,
    marginBottom: 4,
  },
  alertTimestamp: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
});
