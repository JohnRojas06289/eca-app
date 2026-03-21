import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

interface ImpactMetric {
  icon: string;
  color: string;
  bgColor: string;
  value: string;
  unit: string;
  label: string;
  description: string;
}

interface MonthlyPoint {
  month: string;
  kg: number;
}

const IMPACT_METRICS: ImpactMetric[] = [
  {
    icon: 'leaf-outline',
    color: theme.colors.success,
    bgColor: theme.colors.successLight,
    value: '12.450',
    unit: 'kg',
    label: 'Material Reciclado',
    description: 'Total de residuos aprovechados este año',
  },
  {
    icon: 'cloud-outline',
    color: theme.colors.info,
    bgColor: theme.colors.infoLight,
    value: '5.980',
    unit: 'kg CO₂',
    label: 'CO₂ Evitado',
    description: 'Equivalente a retirar 1.3 autos durante 1 año',
  },
  {
    icon: 'water-outline',
    color: theme.colors.plastic,
    bgColor: theme.colors.plasticBg,
    value: '24.900',
    unit: 'L',
    label: 'Agua Ahorrada',
    description: 'Agua que no se usó gracias al reciclaje',
  },
  {
    icon: 'flash-outline',
    color: theme.colors.warning,
    bgColor: theme.colors.warningLight,
    value: '18.675',
    unit: 'kWh',
    label: 'Energía Ahorrada',
    description: 'Energía eléctrica equivalente no consumida',
  },
  {
    icon: 'grid-outline',
    color: theme.colors.cardboard,
    bgColor: theme.colors.cardboardBg,
    value: '312',
    unit: 'árboles',
    label: 'Árboles Equivalentes',
    description: 'Papel y cartón reciclado equivalente a 312 árboles',
  },
  {
    icon: 'people-outline',
    color: theme.colors.primary,
    bgColor: theme.colors.primaryLight,
    value: '24',
    unit: 'familias',
    label: 'Familias Beneficiadas',
    description: 'Recicladores con ingresos directos del programa',
  },
];

const MONTHLY_DATA: MonthlyPoint[] = [
  { month: 'Sep', kg: 820  },
  { month: 'Oct', kg: 960  },
  { month: 'Nov', kg: 1100 },
  { month: 'Dic', kg: 890  },
  { month: 'Ene', kg: 1050 },
  { month: 'Feb', kg: 1230 },
  { month: 'Mar', kg: 1450 },
];

const MAX_KG = Math.max(...MONTHLY_DATA.map((d) => d.kg));

export default function AdminImpactScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={router.back}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Análisis de Impacto</Text>
        <Ionicons name="analytics-outline" size={24} color={theme.colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTag}>IMPACTO AMBIENTAL 2026</Text>
          <Text style={styles.heroValue}>12.450 kg</Text>
          <Text style={styles.heroSubtitle}>Material reciclado en Zipaquirá</Text>
          <View style={styles.heroRow}>
            <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.heroTrend}>+22% vs año anterior</Text>
          </View>
        </View>

        {/* ── Gráfica mensual (barras) ──────────────────────── */}
        <Text style={styles.sectionTitle}>Evolución Mensual</Text>
        <View style={styles.chartCard}>
          <View style={styles.chartBars}>
            {MONTHLY_DATA.map((point) => {
              const heightPct = (point.kg / MAX_KG) * 100;
              return (
                <View key={point.month} style={styles.chartBarCol}>
                  <Text style={styles.chartBarValue}>
                    {point.kg >= 1000
                      ? `${(point.kg / 1000).toFixed(1)}k`
                      : point.kg}
                  </Text>
                  <View style={styles.chartBarTrack}>
                    <View
                      style={[
                        styles.chartBarFill,
                        { height: `${heightPct}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartBarMonth}>{point.month}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Métricas de impacto ───────────────────────────── */}
        <Text style={styles.sectionTitle}>Métricas Detalladas</Text>
        <View style={styles.metricsGrid}>
          {IMPACT_METRICS.map((metric) => (
            <View key={metric.label} style={styles.metricCard}>
              <View style={[styles.metricIconBg, { backgroundColor: metric.bgColor }]}>
                <Ionicons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <Text style={[styles.metricValue, { color: metric.color }]}>
                {metric.value}
              </Text>
              <Text style={styles.metricUnit}>{metric.unit}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricDescription}>{metric.description}</Text>
            </View>
          ))}
        </View>

        {/* ── Comparativa ODS ───────────────────────────────── */}
        <View style={styles.odsCard}>
          <View style={styles.odsHeader}>
            <Ionicons name="globe-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.odsTitle}>Contribución a los ODS</Text>
          </View>
          <Text style={styles.odsBody}>
            El programa ZipaRecicla contribuye directamente a los Objetivos de Desarrollo
            Sostenible: <Text style={styles.odsHighlight}>ODS 11</Text> (Ciudades Sostenibles),{' '}
            <Text style={styles.odsHighlight}>ODS 12</Text> (Producción y Consumo Responsables) y{' '}
            <Text style={styles.odsHighlight}>ODS 13</Text> (Acción por el Clima).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Hero ─────────────────────────────────────────────────
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  heroTag: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  heroValue: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.body,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: theme.spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  heroTrend: {
    fontSize: theme.typography.sizes.small,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: theme.typography.weights.medium,
  },

  // ── Sección ──────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  // ── Gráfica ──────────────────────────────────────────────
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  chartBarCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  chartBarValue: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  chartBarTrack: {
    width: 20,
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartBarFill: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  chartBarMonth: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },

  // ── Métricas ─────────────────────────────────────────────
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  metricCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  metricIconBg: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  metricValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
  },
  metricUnit: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: -theme.spacing.sm,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  metricDescription: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.tiny * theme.typography.lineHeights.normal,
  },

  // ── ODS ──────────────────────────────────────────────────
  odsCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  odsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  odsTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  odsBody: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.relaxed,
  },
  odsHighlight: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
});
