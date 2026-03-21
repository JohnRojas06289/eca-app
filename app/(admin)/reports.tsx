import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

type Period = 'week' | 'month' | 'quarter' | 'year';

interface MaterialStat {
  name: string;
  kg: number;
  percentage: number;
  color: string;
  bgColor: string;
  icon: string;
}

interface RecyclerStat {
  name: string;
  kg: number;
  routes: number;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',    label: 'Semana'    },
  { key: 'month',   label: 'Mes'       },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year',    label: 'Año'       },
];

const MATERIAL_STATS: MaterialStat[] = [
  { name: 'Cartón',  kg: 4820, percentage: 38, color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, icon: 'albums-outline'        },
  { name: 'Plástico',kg: 3150, percentage: 25, color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   icon: 'water-outline'         },
  { name: 'Papel',   kg: 2200, percentage: 18, color: theme.colors.paper,     bgColor: theme.colors.paperBg,     icon: 'document-outline'      },
  { name: 'Metales', kg: 1400, percentage: 11, color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    icon: 'hardware-chip-outline'  },
  { name: 'Vidrio',  kg: 880,  percentage:  7, color: theme.colors.glass,     bgColor: theme.colors.glassBg,     icon: 'wine-outline'          },
];

const TOP_RECYCLERS: RecyclerStat[] = [
  { name: 'Juan Pérez',      kg: 1250, routes: 42 },
  { name: 'Carlos Romero',   kg: 980,  routes: 35 },
  { name: 'Sofía Vargas',    kg: 760,  routes: 28 },
];

const TOTAL_KG     = 12_450;
const TOTAL_VALUE  = 8_960_000;
const TREES_EQUIV  = 312;
const CO2_KG       = 5_980;

export default function AdminReportsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>('month');
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      // ⚠️ Reemplazar con generación real de PDF:
      // await ReportApi.exportPDF({ period });
      await new Promise((r) => setTimeout(r, 1200));
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={handleExport}
          disabled={exporting}
        >
          <Ionicons
            name="download-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.exportBtnText}>{exporting ? 'Generando...' : 'PDF'}</Text>
        </TouchableOpacity>
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
        {/* ── KPIs globales ────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Ionicons name="scale-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.kpiValue}>{TOTAL_KG.toLocaleString('es-CO')}</Text>
            <Text style={styles.kpiLabel}>kg Recolectados</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="cash-outline" size={20} color={theme.colors.warning} />
            <Text style={styles.kpiValue}>
              ${(TOTAL_VALUE / 1_000_000).toFixed(1)}M
            </Text>
            <Text style={styles.kpiLabel}>Valor COP</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="leaf-outline" size={20} color={theme.colors.success} />
            <Text style={styles.kpiValue}>{TREES_EQUIV}</Text>
            <Text style={styles.kpiLabel}>Árboles equiv.</Text>
          </View>
          <View style={styles.kpiCard}>
            <Ionicons name="cloud-outline" size={20} color={theme.colors.info} />
            <Text style={styles.kpiValue}>{CO2_KG.toLocaleString('es-CO')}</Text>
            <Text style={styles.kpiLabel}>kg CO₂ evitado</Text>
          </View>
        </View>

        {/* ── Por tipo de material ──────────────────────────── */}
        <Text style={styles.sectionTitle}>Distribución por Material</Text>
        <View style={styles.materialCard}>
          {MATERIAL_STATS.map((mat, index) => (
            <View key={mat.name}>
              <View style={styles.materialRow}>
                {/* Ícono */}
                <View style={[styles.materialIconBg, { backgroundColor: mat.bgColor }]}>
                  <Ionicons name={mat.icon as any} size={18} color={mat.color} />
                </View>

                {/* Info */}
                <View style={styles.materialInfo}>
                  <View style={styles.materialLabelRow}>
                    <Text style={styles.materialName}>{mat.name}</Text>
                    <Text style={styles.materialKg}>{mat.kg.toLocaleString('es-CO')} kg</Text>
                  </View>
                  {/* Barra de progreso */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${mat.percentage}%`, backgroundColor: mat.color },
                      ]}
                    />
                  </View>
                </View>

                {/* Porcentaje */}
                <Text style={[styles.materialPercent, { color: mat.color }]}>
                  {mat.percentage}%
                </Text>
              </View>
              {index < MATERIAL_STATS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* ── Top recicladores ──────────────────────────────── */}
        <Text style={styles.sectionTitle}>Top Recicladores</Text>
        <View style={styles.recyclerCard}>
          {TOP_RECYCLERS.map((r, index) => {
            const medal = ['🥇', '🥈', '🥉'][index];
            return (
              <View key={r.name}>
                <View style={styles.recyclerRow}>
                  <Text style={styles.recyclerMedal}>{medal}</Text>
                  <View style={styles.recyclerInfo}>
                    <Text style={styles.recyclerName}>{r.name}</Text>
                    <Text style={styles.recyclerMeta}>
                      {r.routes} rutas · {r.kg.toLocaleString('es-CO')} kg
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/(admin)/user-detail' as any)}>
                    <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
                  </TouchableOpacity>
                </View>
                {index < TOP_RECYCLERS.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>

        {/* ── Ver impacto detallado ─────────────────────────── */}
        <CustomButton
          label="Ver Análisis de Impacto"
          leftIcon={
            <Ionicons
              name="analytics-outline"
              size={18}
              color={theme.colors.primary}
            />
          }
          variant="secondary"
          onPress={() => router.push('/(admin)/impact' as any)}
          style={styles.impactBtn}
        />
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
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  exportBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
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

  // ── KPIs ─────────────────────────────────────────────────
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
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
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  kpiLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // ── Secciones ────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  // ── Materiales ───────────────────────────────────────────
  materialCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  materialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  materialIconBg: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  materialInfo: { flex: 1 },
  materialLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  materialName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  materialKg: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.separator,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  materialPercent: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    flexShrink: 0,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.separator,
    marginLeft: theme.spacing.lg + 36 + theme.spacing.md,
  },

  // ── Top recicladores ─────────────────────────────────────
  recyclerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  recyclerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  recyclerMedal: { fontSize: 22, flexShrink: 0 },
  recyclerInfo: { flex: 1 },
  recyclerName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  recyclerMeta: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  impactBtn: {},
});
