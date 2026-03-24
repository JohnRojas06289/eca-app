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

type Period = 'week' | 'month' | 'quarter' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',    label: 'Semana'    },
  { key: 'month',   label: 'Mes'       },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year',    label: 'Año'       },
];

// Mock data por período (escala los valores para dar sensación de cambio)
const DATA: Record<Period, { compras: number; ventas: number; kg: number; recicladores: number }> = {
  week:    { compras: 1_350_000, ventas: 2_180_000, kg: 2_850,  recicladores: 18 },
  month:   { compras: 5_580_000, ventas: 8_960_000, kg: 12_450, recicladores: 24 },
  quarter: { compras: 16_200_000,ventas: 26_400_000,kg: 37_500, recicladores: 24 },
  year:    { compras: 62_000_000,ventas: 99_800_000,kg: 145_000,recicladores: 28 },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString('es-CO')}`;
}

export default function SupervisorReportsScreen() {
  const [period, setPeriod] = useState<Period>('month');
  const d = DATA[period];
  const margen = d.ventas - d.compras;
  const margenPct = Math.round((margen / d.ventas) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compras / Ventas</Text>
      </View>

      {/* ── Filtro de período ─────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodScroll}
      >
        {PERIODS.map((p) => {
          const isActive = period === p.key;
          return (
            <TouchableOpacity
              key={p.key}
              style={[styles.periodChip, isActive && styles.periodChipActive]}
              onPress={() => setPeriod(p.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodLabel, isActive && styles.periodLabelActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Tarjeta compras ───────────────────────────────── */}
        <View style={[styles.flowCard, styles.flowCardCompra]}>
          <View style={styles.flowCardHeader}>
            <View style={[styles.flowIconBg, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="arrow-down-circle-outline" size={24} color="#E65100" />
            </View>
            <View style={styles.flowCardInfo}>
              <Text style={styles.flowCardTitle}>Compras a Recicladores</Text>
              <Text style={styles.flowCardSub}>Lo que la ECA paga a los recicladores</Text>
            </View>
          </View>
          <Text style={[styles.flowCardAmount, { color: '#E65100' }]}>{fmt(d.compras)}</Text>
          <Text style={styles.flowCardKg}>{d.kg.toLocaleString('es-CO')} kg recolectados</Text>
        </View>

        {/* ── Tarjeta ventas ────────────────────────────────── */}
        <View style={[styles.flowCard, styles.flowCardVenta]}>
          <View style={styles.flowCardHeader}>
            <View style={[styles.flowIconBg, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="arrow-up-circle-outline" size={24} color={theme.colors.success} />
            </View>
            <View style={styles.flowCardInfo}>
              <Text style={styles.flowCardTitle}>Ventas al Mercado</Text>
              <Text style={styles.flowCardSub}>Lo que la ECA obtiene al vender el material</Text>
            </View>
          </View>
          <Text style={[styles.flowCardAmount, { color: theme.colors.success }]}>{fmt(d.ventas)}</Text>
          <Text style={styles.flowCardKg}>{d.recicladores} recicladores activos</Text>
        </View>

        {/* ── Barra comparativa ─────────────────────────────── */}
        <View style={styles.compareCard}>
          <Text style={styles.compareTitle}>Distribución de Ingresos</Text>
          <View style={styles.compareBar}>
            <View style={[styles.compareBarCompra, { flex: d.compras }]} />
            <View style={[styles.compareBarMargen, { flex: margen }]} />
          </View>
          <View style={styles.compareLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
              <Text style={styles.legendText}>
                Compras {Math.round((d.compras / d.ventas) * 100)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>
                Margen {margenPct}%
              </Text>
            </View>
          </View>
        </View>

        {/* ── Tarjeta margen ────────────────────────────────── */}
        <View style={styles.marginCard}>
          <View style={styles.marginRow}>
            <View style={[styles.flowIconBg, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="trending-up-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.flowCardInfo}>
              <Text style={styles.flowCardTitle}>Margen Operativo</Text>
              <Text style={styles.flowCardSub}>{margenPct}% sobre las ventas totales</Text>
            </View>
          </View>
          <Text style={[styles.flowCardAmount, { color: theme.colors.primary, marginTop: theme.spacing.md }]}>
            {fmt(margen)}
          </Text>
        </View>

        {/* ── Resumen de KPIs ───────────────────────────────── */}
        <Text style={styles.sectionTitle}>KPIs del Período</Text>
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Ionicons name="scale-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.kpiValue}>{d.kg.toLocaleString('es-CO')}</Text>
            <Text style={styles.kpiLabel}>kg Recolectados</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="people-outline" size={20} color={theme.colors.info} />
            <Text style={styles.kpiValue}>{d.recicladores}</Text>
            <Text style={styles.kpiLabel}>Recicladores</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="cash-outline" size={20} color={theme.colors.warning} />
            <Text style={styles.kpiValue}>{fmt(d.ventas)}</Text>
            <Text style={styles.kpiLabel}>Total Ventas</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="wallet-outline" size={20} color={theme.colors.success} />
            <Text style={styles.kpiValue}>{fmt(margen)}</Text>
            <Text style={styles.kpiLabel}>Margen Neto</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // ── Período ──────────────────────────────────────────────
  periodScroll: {
    paddingHorizontal: theme.spacing.screen,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  periodChip: {
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.chipHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  periodLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  periodLabelActive: { color: theme.colors.textOnPrimary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Flow cards ───────────────────────────────────────────
  flowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  flowCardCompra: {
    borderLeftWidth: 4,
    borderLeftColor: '#E65100',
  },
  flowCardVenta: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  flowCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  flowIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flowCardInfo: { flex: 1 },
  flowCardTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  flowCardSub: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  flowCardAmount: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 4,
  },
  flowCardKg: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },

  // ── Barra comparativa ────────────────────────────────────
  compareCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  compareTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  compareBar: {
    flexDirection: 'row',
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  compareBarCompra: { backgroundColor: '#E65100' },
  compareBarMargen: { backgroundColor: theme.colors.primary },
  compareLegend: {
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
    fontWeight: theme.typography.weights.medium,
  },

  // ── Margen card ──────────────────────────────────────────
  marginCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  marginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },

  // ── KPI grid ─────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  kpiCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  kpiValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  kpiLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
