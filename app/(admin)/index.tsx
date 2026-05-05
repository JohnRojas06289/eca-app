import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { StatCard } from '@/src/components/StatCard';
import { CustomButton } from '@/src/components/CustomButton';
import { useAuth } from '@/src/hooks/useAuth';
import { formatDateTime, formatShortDateTime } from '@/src/utils/date';

interface AlertRow {
  id: string;
  title: string;
  body: string;
  severity: 'warning' | 'error' | 'info';
  timestamp: string;
}

const now = new Date();
const RECENT_ALERTS: AlertRow[] = [
  {
    id: '1',
    title: 'Pesajes por validar',
    body: '3 pesajes llevan más de 30 minutos en estado pendiente.',
    severity: 'warning',
    timestamp: formatShortDateTime(new Date(now.getTime() - 20 * 60 * 1000)),
  },
  {
    id: '2',
    title: 'Incidencia de ruta',
    body: 'Ruta Centro Histórico reporta bloqueo parcial en la parada #15.',
    severity: 'error',
    timestamp: formatShortDateTime(new Date(now.getTime() - 58 * 60 * 1000)),
  },
  {
    id: '3',
    title: 'Nuevo reciclador registrado',
    body: 'María González completó registro y requiere aprobación documental.',
    severity: 'info',
    timestamp: formatShortDateTime(new Date(now.getTime() - 2.5 * 60 * 60 * 1000)),
  },
];

const SEVERITY_CONFIG = {
  warning: { icon: 'warning-outline', color: theme.colors.warning, bgColor: theme.colors.warningLight },
  error: { icon: 'alert-circle-outline', color: theme.colors.error, bgColor: theme.colors.errorLight },
  info: { icon: 'information-circle-outline', color: theme.colors.info, bgColor: theme.colors.infoLight },
};

const QUICK_ACTIONS = [
  { label: 'Registrar entrada', icon: 'add-circle-outline', route: '/(admin)/new-weighing' },
  { label: 'Reportes', icon: 'bar-chart-outline', route: '/(admin)/reports' },
  { label: 'Rutas', icon: 'map-outline', route: '/(admin)/routes' },
  { label: 'Validar', icon: 'checkmark-circle-outline', route: '/(admin)/validate' },
  { label: 'Usuarios', icon: 'people-outline', route: '/(admin)/users' },
];

const DRAWER_ACTIONS = [
  { label: 'Reportes', icon: 'bar-chart-outline', route: '/(admin)/reports' },
  { label: 'Rutas', icon: 'map-outline', route: '/(admin)/routes' },
  { label: 'Usuarios', icon: 'people-outline', route: '/(admin)/users' },
  { label: 'Registrar entrada', icon: 'add-circle-outline', route: '/(admin)/new-weighing' },
  { label: 'Validar entradas', icon: 'checkmark-circle-outline', route: '/(admin)/validate' },
  { label: 'Alertas', icon: 'notifications-outline', route: '/(admin)/alerts' },
  { label: 'Precios', icon: 'pricetag-outline', route: '/(admin)/prices' },
  { label: 'Ajustes', icon: 'settings-outline', route: '/(admin)/settings' },
];

export default function AdminHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();

  const firstName = user?.name?.split(' ')[0] ?? 'Admin';
  const showMobileMenu = Platform.OS !== 'web' || width < 900;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.headerKicker}>Centro de operación</Text>
            <Text style={styles.headerName}>Hola, {firstName}</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Última actualización: {formatDateTime()}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push('/(admin)/alerts' as any)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            {showMobileMenu && (
              <TouchableOpacity
                style={styles.notifBtn}
                onPress={() => setMenuOpen(true)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="menu-outline" size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <StatCard
          variant="hero"
          label="MATERIAL RECUPERADO"
          value="12.450"
          unit="kg"
          trend="Acumulado abril"
          trendDirection="up"
          style={styles.heroCard}
        />

        <View style={styles.statsRow}>
          <StatCard
            variant="compact"
            label="Rutas activas"
            value="6"
            icon="map-outline"
            iconColor={theme.colors.info}
            iconBgColor={theme.colors.infoLight}
            style={styles.statCardHalf}
          />
          <StatCard
            variant="compact"
            label="Pesajes hoy"
            value="38"
            icon="scale-outline"
            iconColor={theme.colors.primary}
            style={styles.statCardHalf}
          />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            variant="compact"
            label="Pendientes"
            value="3"
            icon="hourglass-outline"
            iconColor={theme.colors.warning}
            iconBgColor={theme.colors.warningLight}
            style={styles.statCardHalf}
          />
          <StatCard
            variant="compact"
            label="Incidencias"
            value="2"
            icon="alert-circle-outline"
            iconColor={theme.colors.error}
            iconBgColor={theme.colors.errorLight}
            style={styles.statCardHalf}
          />
        </View>

        <Text style={styles.sectionTitle}>Opciones rápidas</Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.route}
              style={styles.quickActionCard}
              activeOpacity={0.85}
              onPress={() => router.push(action.route as any)}
            >
              <View style={styles.quickActionIconBg}>
                <Ionicons name={action.icon as any} size={18} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.operationsCard}>
          <Text style={styles.operationsTitle}>Operación de hoy</Text>
          <View style={styles.operationsRow}>
            <Ionicons name="checkmark-done-outline" size={16} color={theme.colors.success} />
            <Text style={styles.operationsText}>35 pesajes ya confirmados.</Text>
          </View>
          <View style={styles.operationsRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
            <Text style={styles.operationsText}>3 pesajes requieren validación inmediata.</Text>
          </View>
          <View style={styles.operationsRow}>
            <Ionicons name="car-outline" size={16} color={theme.colors.info} />
            <Text style={styles.operationsText}>6 rutas están en ejecución.</Text>
          </View>

          <View style={styles.operationsActions}>
            <CustomButton
              label="Validar pesajes"
              onPress={() => router.push('/(admin)/validate' as any)}
              size="md"
              style={styles.flexBtn}
            />
            <CustomButton
              label="Ver rutas"
              variant="secondary"
              onPress={() => router.push('/(admin)/routes' as any)}
              size="md"
              style={styles.flexBtn}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alertas recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(admin)/alerts' as any)}>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {RECENT_ALERTS.map((alert) => {
          const config = SEVERITY_CONFIG[alert.severity];
          return (
            <View key={alert.id} style={styles.alertCard}>
              <View style={[styles.alertIconBg, { backgroundColor: config.bgColor }]}>
                <Ionicons name={config.icon as any} size={18} color={config.color} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertBody} numberOfLines={2}>
                  {alert.body}
                </Text>
                <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {showMobileMenu && (
      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={styles.drawerOverlay}>
          <Pressable style={styles.drawerBackdrop} onPress={() => setMenuOpen(false)} />
          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menú</Text>
              <TouchableOpacity onPress={() => setMenuOpen(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {DRAWER_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.route}
                style={styles.drawerItem}
                onPress={() => {
                  setMenuOpen(false);
                  router.push(action.route as any);
                }}
              >
                <Ionicons name={action.icon as any} size={18} color={theme.colors.textSecondary} />
                <Text style={styles.drawerItemText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  scrollView: {
    width: '100%',
    maxWidth: '100%',
  },
  scroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: theme.spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  headerKicker: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  headerName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },

  heroCard: { marginBottom: theme.spacing.lg },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCardHalf: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  quickActionCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  quickActionIconBg: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  operationsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  operationsTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  operationsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  operationsText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  operationsActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  flexBtn: { flex: 1 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  sectionLink: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },

  alertCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  alertIconBg: {
    width: 36,
    height: 36,
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
    marginBottom: 4,
  },
  alertTimestamp: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawerPanel: {
    width: '78%',
    maxWidth: 320,
    backgroundColor: theme.colors.surface,
    paddingTop: theme.spacing.huge,
    paddingHorizontal: theme.spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  drawerTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  drawerItemText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
  },
});
