import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { SelectableCard } from '@/src/components/SelectableCard';
import { exportCSV, exportPDF, generatePDFHtml } from '@/src/utils/export';
import { HtmlPreview } from '@/src/components/HtmlPreview';
import { formatDateTime } from '@/src/utils/date';

type Period = 'week' | 'month' | 'quarter' | 'year' | 'custom';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',    label: 'Semana'    },
  { key: 'month',   label: 'Mes'       },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year',    label: 'Año'       },
  { key: 'custom',  label: 'Personalizado' },
];

// Mock data por período (escala los valores para dar sensación de cambio)
const DATA: Record<Period, { compras: number; ventas: number; kg: number; recicladores: number }> = {
  week:    { compras: 1_350_000, ventas: 2_180_000, kg: 2_850,  recicladores: 18 },
  month:   { compras: 5_580_000, ventas: 8_960_000, kg: 12_450, recicladores: 24 },
  quarter: { compras: 16_200_000,ventas: 26_400_000,kg: 37_500, recicladores: 24 },
  year:    { compras: 62_000_000,ventas: 99_800_000,kg: 145_000,recicladores: 28 },
  custom:  { compras: 8_200_000, ventas: 12_500_000,kg: 18_200, recicladores: 25 },
};

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString('es-CO')}`;
}

export default function SupervisorReportsScreen() {
  const [period, setPeriod] = useState<Period>('month');
  const now = new Date();
  const customStart = new Date(now);
  customStart.setDate(customStart.getDate() - 30);
  const customStartLabel = customStart.toLocaleDateString('es-CO');
  const customEndLabel = now.toLocaleDateString('es-CO');
  const d = DATA[period];
  const margen = d.ventas - d.compras;
  const margenPct = Math.round((margen / d.ventas) * 100);

  const [exporting, setExporting] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportFields, setExportFields] = useState({
    financial: true,
    kpi: true,
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  const toggleField = (field: keyof typeof exportFields) => {
    setExportFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  function buildExportData() {
    return {
      title: `Reporte de Supervisor (${period})`,
      fields: exportFields,
      kpiData: {
        'Total Ventas': fmt(d.ventas),
        'Margen Neto': fmt(margen),
        'kg Recolectados': `${d.kg.toLocaleString('es-CO')} kg`,
        'Recicladores Activos': `${d.recicladores}`,
      },
      financialData: {
        compras: d.compras,
        ventas: d.ventas,
        margen: margen,
        margenPct: margenPct,
      },
    };
  }

  function handleExport() {
    setExportModalVisible(false);
    if (exportFormat === 'pdf') {
      setPreviewHtml(generatePDFHtml(buildExportData()));
      setPreviewVisible(true);
    } else {
      confirmExport();
    }
  }

  async function confirmExport() {
    setPreviewVisible(false);
    setExporting(true);
    try {
      const data = buildExportData();
      if (exportFormat === 'csv') {
        await exportCSV(data, `reporte_supervisor_${period}`);
      } else {
        await exportPDF(data, `reporte_supervisor_${period}`);
      }
      Alert.alert('Éxito', `Reporte exportado como ${exportFormat.toUpperCase()} exitosamente.`);
    } catch (e) {
      Alert.alert('Error', 'Hubo un problema exportando el archivo.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Compras / Ventas</Text>
          <Text style={styles.headerSubtitle}>Corte: {formatDateTime(now)}</Text>
        </View>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => setExportModalVisible(true)}
          disabled={exporting}
        >
          <Ionicons
            name="download-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text style={styles.exportBtnText}>{exporting ? 'Generando...' : 'Exportar'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Filtro de período ─────────────────────────────── */}
      <ScrollView
        style={styles.periodContainer}
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

      {period === 'custom' && (
        <View style={styles.customDateContainer}>
          <TouchableOpacity style={styles.dateInput}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>Fecha Inicio: {customStartLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateInput}>
            <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.dateText}>Fecha Fin: {customEndLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {/* ── Modal de Preview PDF ─────────────────────────── */}
      <Modal
        visible={previewVisible}
        animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <SafeAreaView style={styles.safe}>
          <View style={styles.previewHeader}>
            <TouchableOpacity onPress={() => setPreviewVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.previewTitle}>Vista previa del PDF</Text>
            <View style={{ width: 24 }} />
          </View>
          <HtmlPreview html={previewHtml} />
          <View style={styles.previewFooter}>
            <TouchableOpacity
              style={styles.previewCancelBtn}
              onPress={() => setPreviewVisible(false)}
            >
              <Text style={styles.previewCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <CustomButton
              label="Descargar PDF"
              onPress={confirmExport}
              style={styles.previewDownloadBtn}
              leftIcon={<Ionicons name="download-outline" size={18} color={theme.colors.textOnPrimary} />}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Modal de Exportación ──────────────────────────── */}
      <Modal
        visible={exportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurar Exportación</Text>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>Formato de archivo</Text>
            <View style={styles.formatRow}>
              <SelectableCard
                layout="grid"
                label="PDF"
                icon="document-text-outline"
                selected={exportFormat === 'pdf'}
                onPress={() => setExportFormat('pdf')}
                style={styles.formatCard}
              />
              <SelectableCard
                layout="grid"
                label="Excel (CSV)"
                icon="grid-outline"
                selected={exportFormat === 'csv'}
                onPress={() => setExportFormat('csv')}
                style={styles.formatCard}
              />
            </View>

            <Text style={styles.modalSubtitle}>Información a incluir</Text>

            <View style={styles.checkboxGroup}>
              <TouchableOpacity
                style={[styles.checkboxRow, exportFields.financial && styles.checkboxRowActive]}
                onPress={() => toggleField('financial')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={exportFields.financial ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={exportFields.financial ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.checkboxLabel, exportFields.financial && styles.checkboxLabelActive]}>
                  Resumen de Compras y Ventas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxRow, exportFields.kpi && styles.checkboxRowActive]}
                onPress={() => toggleField('kpi')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={exportFields.kpi ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={exportFields.kpi ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.checkboxLabel, exportFields.kpi && styles.checkboxLabelActive]}>
                  KPIs Operativos
                </Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              label={`Descargar ${exportFormat.toUpperCase()}`}
              onPress={handleExport}
              style={styles.downloadBtn}
              leftIcon={<Ionicons name="download-outline" size={20} color={theme.colors.textOnPrimary} />}
            />
          </View>
        </View>
      </Modal>
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
  headerSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  periodContainer: {
    minHeight: theme.sizes.chipHeight + theme.spacing.md + 4,
    overflow: 'visible',
  },
  periodScroll: {
    paddingHorizontal: theme.spacing.screen,
    paddingTop: 2,
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

  customDateContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.screen,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  dateText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textPrimary,
  },

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

  // ── Modal de Exportación ─────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  formatRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  formatCard: {
    flex: 1,
  },
  checkboxGroup: {
    gap: theme.spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
  },
  checkboxRowActive: {
    borderColor: theme.colors.primary + '66',
    backgroundColor: theme.colors.primaryLight,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  checkboxLabelActive: {
    color: theme.colors.primaryDark,
    fontWeight: theme.typography.weights.semibold,
  },
  downloadBtn: {
    marginTop: theme.spacing.xl,
  },

  // ── Preview PDF ──────────────────────────────────────────
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  previewTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  webview: {
    flex: 1,
  },
  previewFooter: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.screen,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  previewCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.md,
  },
  previewCancelText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  previewDownloadBtn: {
    flex: 2,
  },
});
