import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { useAuth } from '@/src/hooks/useAuth';

// ── Mock KPIs ────────────────────────────────────────────────────────────────
const KPI_RECICLADORES      = 24;
const KPI_MATERIAL_KG       = 12_450;
const KPI_COMPRAS_COP       = 5_580_000;
const KPI_VENTAS_COP        = 8_960_000;
const KPI_MARGEN_COP        = KPI_VENTAS_COP - KPI_COMPRAS_COP;
const KPI_RUTAS_ACTIVAS     = 6;
const KPI_PESAJES_MES       = 38;
const KPI_MARGEN_PCT        = Math.round((KPI_MARGEN_COP / KPI_VENTAS_COP) * 100);

export default function SupervisorHomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'Supervisor';

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
            <Text style={styles.headerWelcome}>PANEL DE SUPERVISIÓN</Text>
            <Text style={styles.headerName}>Hola, {firstName}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── Banner informativo ────────────────────────────── */}
        <View style={styles.infoBanner}>
          <Ionicons name="eye-outline" size={16} color={theme.colors.info} />
          <Text style={styles.infoBannerText}>
            Acceso de solo lectura. Para gestionar usuarios o pesajes contacta al administrador.
          </Text>
        </View>

        {/* ── KPI principal: Recicladores ───────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconBg}>
            <Ionicons name="people-outline" size={32} color={theme.colors.textOnPrimary} />
          </View>
          <View>
            <Text style={styles.heroValue}>{KPI_RECICLADORES}</Text>
            <Text style={styles.heroLabel}>Recicladores Asociados</Text>
          </View>
        </View>

        {/* ── KPI: Material recolectado ─────────────────────── */}
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="scale-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.kpiInfo}>
            <Text style={styles.kpiLabel}>Material Recolectado</Text>
            <Text style={styles.kpiValue}>{KPI_MATERIAL_KG.toLocaleString('es-CO')} kg</Text>
          </View>
          <Text style={styles.kpiPeriod}>Este mes</Text>
        </View>

        {/* ── Fila: Rutas y Pesajes ─────────────────────────── */}
        <View style={styles.row}>
          <View style={[styles.smallCard, { flex: 1 }]}>
            <View style={[styles.smallIconBg, { backgroundColor: theme.colors.infoLight }]}>
              <Ionicons name="map-outline" size={20} color={theme.colors.info} />
            </View>
            <Text style={styles.smallValue}>{KPI_RUTAS_ACTIVAS}</Text>
            <Text style={styles.smallLabel}>Rutas Activas</Text>
          </View>
          <View style={[styles.smallCard, { flex: 1 }]}>
            <View style={[styles.smallIconBg, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="clipboard-outline" size={20} color={theme.colors.warning} />
            </View>
            <Text style={styles.smallValue}>{KPI_PESAJES_MES}</Text>
            <Text style={styles.smallLabel}>Pesajes del Mes</Text>
          </View>
        </View>

        {/* ── Sección: Financiero ───────────────────────────── */}
        <Text style={styles.sectionTitle}>Resumen Financiero</Text>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="arrow-down-circle-outline" size={22} color="#E65100" />
          </View>
          <View style={styles.kpiInfo}>
            <Text style={styles.kpiLabel}>Compras a Recicladores</Text>
            <Text style={[styles.kpiValue, { color: '#E65100' }]}>
              ${(KPI_COMPRAS_COP / 1_000_000).toFixed(2)}M COP
            </Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: theme.colors.successLight }]}>
            <Ionicons name="arrow-up-circle-outline" size={22} color={theme.colors.success} />
          </View>
          <View style={styles.kpiInfo}>
            <Text style={styles.kpiLabel}>Ventas al Mercado</Text>
            <Text style={[styles.kpiValue, { color: theme.colors.success }]}>
              ${(KPI_VENTAS_COP / 1_000_000).toFixed(2)}M COP
            </Text>
          </View>
        </View>

        <View style={styles.marginCard}>
          <View style={styles.marginHeader}>
            <Ionicons name="trending-up-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.marginTitle}>Margen Operativo</Text>
          </View>
          <Text style={styles.marginValue}>
            ${(KPI_MARGEN_COP / 1_000_000).toFixed(2)}M COP
          </Text>
          <Text style={styles.marginPct}>{KPI_MARGEN_PCT}% sobre ventas</Text>
          {/* Barra visual */}
          <View style={styles.barTrack}>
            <View style={[styles.barCompra, { flex: KPI_COMPRAS_COP }]} />
            <View style={[styles.barMargen, { flex: KPI_MARGEN_COP }]} />
          </View>
          <View style={styles.barLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
              <Text style={styles.legendText}>Compras</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Margen</Text>
            </View>
          </View>
        </View>

        {/* ── Ir a reportes ─────────────────────────────────── */}
        <TouchableOpacity
          style={styles.reportsBtn}
          onPress={() => router.push('/(supervisor)/reports' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="swap-vertical-outline" size={20} color={theme.colors.textOnPrimary} />
          <Text style={styles.reportsBtnText}>Ver Comparativo Detallado</Text>
        </TouchableOpacity>
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
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  // ── Banner ───────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.info,
    lineHeight: theme.typography.sizes.small * theme.typography.lineHeights.normal,
  },

  // ── Hero card ────────────────────────────────────────────
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  heroIconBg: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.circle,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroValue: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
  },
  heroLabel: {
    fontSize: theme.typography.sizes.body,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: theme.typography.weights.medium,
  },

  // ── KPI card ─────────────────────────────────────────────
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  kpiIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiInfo: { flex: 1 },
  kpiLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  kpiValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  kpiPeriod: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Fila pequeña ─────────────────────────────────────────
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  smallCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  smallIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  smallLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // ── Sección ──────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  // ── Margen card ──────────────────────────────────────────
  marginCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  marginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  marginTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  marginValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  marginPct: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  barTrack: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  barCompra: {
    backgroundColor: '#E65100',
  },
  barMargen: {
    backgroundColor: theme.colors.primary,
  },
  barLegend: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  // ── Botón reportes ───────────────────────────────────────
  reportsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.lg,
    ...theme.shadows.md,
  },
  reportsBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
});
