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
import { useRouter } from 'expo-router';
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
type ReportMode = 'sui' | 'internal';

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

interface SuiField {
  label: string;
  value: string;
}

interface ReportDataset {
  totalKg: number;
  totalValue: number;
  treesEquiv: number;
  co2Kg: number;
  comprasRecicladores: number;
  ventasMercado: number;
  materialStats: MaterialStat[];
  topRecyclers: RecyclerStat[];
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',    label: 'Semana'    },
  { key: 'month',   label: 'Mes'       },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year',    label: 'Año'       },
  { key: 'custom',  label: 'Personalizado' },
];

const REPORT_DATASETS: Record<ReportMode, ReportDataset> = {
  internal: {
    totalKg: 12_450,
    totalValue: 8_960_000,
    treesEquiv: 312,
    co2Kg: 5_980,
    comprasRecicladores: 5_580_000,
    ventasMercado: 8_960_000,
    materialStats: [
      { name: 'Cartón',  kg: 4820, percentage: 38, color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, icon: 'albums-outline' },
      { name: 'Plástico',kg: 3150, percentage: 25, color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   icon: 'water-outline' },
      { name: 'Papel',   kg: 2200, percentage: 18, color: theme.colors.paper,     bgColor: theme.colors.paperBg,     icon: 'document-outline' },
      { name: 'Metales', kg: 1400, percentage: 11, color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    icon: 'hardware-chip-outline' },
      { name: 'Vidrio',  kg: 880,  percentage: 7,  color: theme.colors.glass,     bgColor: theme.colors.glassBg,     icon: 'wine-outline' },
      { name: 'RCD',     kg: 0,    percentage: 0,  color: theme.colors.rcd,       bgColor: theme.colors.rcdBg,       icon: 'hammer-outline' },
      { name: 'Rechazo', kg: 0,    percentage: 0,  color: theme.colors.waste,     bgColor: theme.colors.wasteBg,     icon: 'trash-bin-outline' },
    ],
    topRecyclers: [
      { name: 'Juan Pérez',    kg: 1250, routes: 42 },
      { name: 'Carlos Romero', kg: 980,  routes: 35 },
      { name: 'Sofía Vargas',  kg: 760,  routes: 28 },
    ],
  },
  sui: {
    totalKg: 13_880,
    totalValue: 9_420_000,
    treesEquiv: 348,
    co2Kg: 6_440,
    comprasRecicladores: 5_910_000,
    ventasMercado: 9_420_000,
    materialStats: [
      { name: 'Cartón',  kg: 5050, percentage: 36, color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, icon: 'albums-outline' },
      { name: 'Plástico',kg: 3600, percentage: 26, color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   icon: 'water-outline' },
      { name: 'Papel',   kg: 2360, percentage: 17, color: theme.colors.paper,     bgColor: theme.colors.paperBg,     icon: 'document-outline' },
      { name: 'Metales', kg: 1600, percentage: 12, color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    icon: 'hardware-chip-outline' },
      { name: 'Vidrio',  kg: 900,  percentage: 6,  color: theme.colors.glass,     bgColor: theme.colors.glassBg,     icon: 'wine-outline' },
      { name: 'RCD',     kg: 220,  percentage: 2,  color: theme.colors.rcd,       bgColor: theme.colors.rcdBg,       icon: 'hammer-outline' },
      { name: 'Rechazo', kg: 150,  percentage: 1,  color: theme.colors.waste,     bgColor: theme.colors.wasteBg,     icon: 'trash-bin-outline' },
    ],
    topRecyclers: [
      { name: 'Nidia Gutiérrez', kg: 1320, routes: 46 },
      { name: 'Juan Pérez',      kg: 1180, routes: 40 },
      { name: 'Carlos Romero',   kg: 940,  routes: 34 },
    ],
  },
};

const WEEKDAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('es-CO');
}

function parseDateLabel(input: string): Date | null {
  const clean = input.trim();
  const match = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function isSameDate(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const today = new Date();
  const [period, setPeriod] = useState<Period>('month');
  const [reportMode, setReportMode] = useState<ReportMode>('sui');
  const [exporting, setExporting] = useState(false);

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportFields, setExportFields] = useState({
    kpi: true,
    financial: true,
    materials: true,
    recyclers: true,
  });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 30);
  const [dateFrom, setDateFrom] = useState(formatDateLabel(defaultFrom));
  const [dateTo, setDateTo] = useState(formatDateLabel(today));
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarTarget, setCalendarTarget] = useState<'from' | 'to'>('from');
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const toggleField = (field: keyof typeof exportFields) => {
    setExportFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const now = new Date();
  const data = REPORT_DATASETS[reportMode];
  const TOTAL_KG = data.totalKg;
  const TOTAL_VALUE = data.totalValue;
  const TREES_EQUIV = data.treesEquiv;
  const CO2_KG = data.co2Kg;
  const COMPRAS_RECICLADORES = data.comprasRecicladores;
  const VENTAS_MERCADO = data.ventasMercado;
  const MARGEN = VENTAS_MERCADO - COMPRAS_RECICLADORES;
  const MARGEN_PCT = VENTAS_MERCADO > 0 ? Math.round((MARGEN / VENTAS_MERCADO) * 100) : 0;
  const MATERIAL_STATS = data.materialStats;
  const TOP_RECYCLERS = data.topRecyclers;
  const SUI_REQUIRED_FIELDS: SuiField[] = [
    { label: 'Prestador', value: 'ECA ZipaRecicla' },
    { label: 'NIT', value: '900123456-7' },
    { label: 'Municipio', value: 'Zipaquirá' },
    { label: 'Código DANE', value: '25899' },
    { label: 'Período reportado', value: `${dateFrom} → ${dateTo}` },
    { label: 'Toneladas aprovechadas', value: `${(TOTAL_KG / 1000).toFixed(2)} t` },
    { label: 'Toneladas rechazo', value: `${((MATERIAL_STATS.find((m) => m.name === 'Rechazo')?.kg ?? 0) / 1000).toFixed(2)} t` },
    { label: 'Usuarios atendidos', value: '1.248' },
    { label: 'Microrutas atendidas', value: '64' },
    { label: 'Frecuencia de recolección', value: 'Semanal' },
    { label: 'Costo de aprovechamiento (COP)', value: COMPRAS_RECICLADORES.toLocaleString('es-CO') },
    { label: 'Ingresos por comercialización (COP)', value: VENTAS_MERCADO.toLocaleString('es-CO') },
    { label: 'Certificado de pesaje consolidado', value: 'Sí' },
    { label: 'Fecha de corte', value: formatDateTime(now) },
  ];

  function handlePeriodChange(next: Period) {
    setPeriod(next);
    const end = new Date();
    const start = new Date(end);
    const daysByPeriod: Record<Period, number> = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365,
      custom: 14,
    };
    start.setDate(end.getDate() - (daysByPeriod[next] - 1));
    setDateFrom(start.toLocaleDateString('es-CO'));
    setDateTo(end.toLocaleDateString('es-CO'));
  }

  function applyDateFilter() {
    const from = parseDateLabel(dateFrom);
    const to = parseDateLabel(dateTo);
    if (!from || !to) {
      Alert.alert('Filtro de fechas', 'Selecciona fecha inicial y fecha final válidas.');
      return;
    }
    if (from.getTime() > to.getTime()) {
      Alert.alert('Rango inválido', 'La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }
    Alert.alert('Filtro aplicado', `Rango: ${dateFrom} → ${dateTo}`);
  }

  function openCalendar(target: 'from' | 'to') {
    setCalendarTarget(target);
    const baseDate = parseDateLabel(target === 'from' ? dateFrom : dateTo) ?? today;
    setCalendarMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setCalendarVisible(true);
  }

  function pickCalendarDate(day: number) {
    const picked = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const label = formatDateLabel(picked);
    if (calendarTarget === 'from') {
      setDateFrom(label);
    } else {
      setDateTo(label);
    }
    setCalendarVisible(false);
  }

  function buildExportData() {
    return {
      title: `Reporte ${reportMode === 'sui' ? 'SUI' : 'Interno'} (${period})`,
      dateRange: `${dateFrom} → ${dateTo}`,
      fields: exportFields,
      reportMode,
      kpiData: {
        'Material Recolectado': `${TOTAL_KG.toLocaleString('es-CO')} kg`,
        'Ventas COP': `$${(TOTAL_VALUE / 1_000_000).toFixed(2)}M`,
        'Equivalente Ambiental': `${TREES_EQUIV} árboles`,
        'CO2 Evitado': `${CO2_KG.toLocaleString('es-CO')} kg`,
      },
      financialData: {
        compras: COMPRAS_RECICLADORES,
        ventas: VENTAS_MERCADO,
        margen: MARGEN,
        margenPct: MARGEN_PCT,
      },
      materialsData: MATERIAL_STATS.map((m) => ({ name: m.name, kg: m.kg, percentage: m.percentage })),
      recyclersData: TOP_RECYCLERS.map((r) => ({ name: r.name, kg: r.kg, routes: r.routes })),
      suiData: reportMode === 'sui' ? SUI_REQUIRED_FIELDS : [],
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
        await exportCSV(data, `reporte_admin_${period}`);
      } else {
        await exportPDF(data, `reporte_admin_${period}`);
      }
      Alert.alert('Éxito', `Reporte exportado como ${exportFormat.toUpperCase()} exitosamente.`);
    } catch (e) {
      Alert.alert('Error', 'Hubo un problema exportando el archivo.');
    } finally {
      setExporting(false);
    }
  }

  const fromDateObj = parseDateLabel(dateFrom);
  const toDateObj = parseDateLabel(dateTo);
  const monthTitle = calendarMonth.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  const calendarDaysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const monthFirstWeekday = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7;
  const calendarCells: Array<number | null> = [
    ...Array.from({ length: monthFirstWeekday }, () => null),
    ...Array.from({ length: calendarDaysInMonth }, (_, idx) => idx + 1),
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reportes</Text>
          <Text style={styles.headerSubtitle}>
            {reportMode === 'sui' ? 'Modo SUI' : 'Modo Interno'} · Corte: {formatDateTime(now)}
          </Text>
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

      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeBtn, reportMode === 'sui' && styles.modeBtnActive]}
          onPress={() => setReportMode('sui')}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, reportMode === 'sui' && styles.modeBtnTextActive]}>
            Reporte SUI
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, reportMode === 'internal' && styles.modeBtnActive]}
          onPress={() => setReportMode('internal')}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, reportMode === 'internal' && styles.modeBtnTextActive]}>
            Reporte Interno
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.customDateContainer}>
        <TouchableOpacity style={styles.dateInput} onPress={() => openCalendar('from')} activeOpacity={0.85}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.dateTextInput}>Inicio: {dateFrom}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateInput} onPress={() => openCalendar('to')} activeOpacity={0.85}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
          <Text style={styles.dateTextInput}>Fin: {dateTo}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.applyDateRow}>
        <TouchableOpacity style={styles.applyDateBtn} onPress={applyDateFilter} activeOpacity={0.85}>
          <Ionicons name="funnel-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.applyDateText}>Aplicar filtro de fechas</Text>
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
              onPress={() => handlePeriodChange(p.key)}
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
        <View style={styles.rangeHintCard}>
          <Ionicons name="calendar-clear-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.rangeHintText}>Rango aplicado: {dateFrom} → {dateTo}</Text>
        </View>

        {reportMode === 'sui' && (
          <>
            <Text style={styles.sectionTitle}>Campos requeridos SUI</Text>
            <View style={styles.suiCard}>
              {SUI_REQUIRED_FIELDS.map((item, index) => (
                <View key={item.label}>
                  <View style={styles.suiRow}>
                    <Text style={styles.suiLabel}>{item.label}</Text>
                    <Text style={styles.suiValue}>{item.value}</Text>
                  </View>
                  {index < SUI_REQUIRED_FIELDS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── KPIs globales ────────────────────────────────── */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBg, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="scale-outline" size={22} color={theme.colors.primary} />
            </View>
            <Text style={styles.kpiValue}>{TOTAL_KG.toLocaleString('es-CO')} kg</Text>
            <Text style={styles.kpiLabel}>Material recolectado</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBg, { backgroundColor: theme.colors.warningLight }]}>
              <Ionicons name="cash-outline" size={22} color={theme.colors.warning} />
            </View>
            <Text style={styles.kpiValue}>${(TOTAL_VALUE / 1_000_000).toFixed(2)}M</Text>
            <Text style={styles.kpiLabel}>Ventas COP</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBg, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="leaf-outline" size={22} color={theme.colors.success} />
            </View>
            <Text style={styles.kpiValue}>{TREES_EQUIV} árboles</Text>
            <Text style={styles.kpiLabel}>Equivalente ambiental</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={[styles.kpiIconBg, { backgroundColor: theme.colors.infoLight }]}>
              <Ionicons name="cloud-outline" size={22} color={theme.colors.info} />
            </View>
            <Text style={styles.kpiValue}>{CO2_KG.toLocaleString('es-CO')} kg</Text>
            <Text style={styles.kpiLabel}>CO₂ evitado</Text>
          </View>
        </View>

        {/* ── Comparativo Compras / Ventas ──────────────────── */}
        <Text style={styles.sectionTitle}>Comparativo Compras / Ventas</Text>
        <View style={[styles.flowCard, { borderLeftColor: '#E65100' }]}>
          <View style={styles.flowRow}>
            <View style={[styles.flowIconBg, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="arrow-down-circle-outline" size={22} color="#E65100" />
            </View>
            <View style={styles.flowInfo}>
              <Text style={styles.flowLabel}>Compras a Recicladores</Text>
              <Text style={[styles.flowAmount, { color: '#E65100' }]}>
                ${(COMPRAS_RECICLADORES / 1_000_000).toFixed(2)}M COP
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.flowCard, { borderLeftColor: theme.colors.success }]}>
          <View style={styles.flowRow}>
            <View style={[styles.flowIconBg, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="arrow-up-circle-outline" size={22} color={theme.colors.success} />
            </View>
            <View style={styles.flowInfo}>
              <Text style={styles.flowLabel}>Ventas al Mercado</Text>
              <Text style={[styles.flowAmount, { color: theme.colors.success }]}>
                ${(VENTAS_MERCADO / 1_000_000).toFixed(2)}M COP
              </Text>
            </View>
          </View>
        </View>
        {/* Barra visual proporcional */}
        <View style={styles.compareBarCard}>
          <View style={styles.compareBar}>
            <View style={[styles.barCompra, { flex: COMPRAS_RECICLADORES }]} />
            <View style={[styles.barMargen, { flex: MARGEN }]} />
          </View>
          <View style={styles.barLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
              <Text style={styles.legendText}>
                Compras {Math.round((COMPRAS_RECICLADORES / VENTAS_MERCADO) * 100)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={styles.legendText}>Margen {MARGEN_PCT}%</Text>
            </View>
          </View>
          <View style={[styles.flowRow, styles.marginRow]}>
            <View style={[styles.flowIconBg, { backgroundColor: theme.colors.primaryLight }]}>
              <Ionicons name="trending-up-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.flowInfo}>
              <Text style={styles.flowLabel}>Margen Operativo ({MARGEN_PCT}%)</Text>
              <Text style={[styles.flowAmount, { color: theme.colors.primary }]}>
                ${(MARGEN / 1_000_000).toFixed(2)}M COP
              </Text>
            </View>
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

      <Modal
        visible={calendarVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>
                Seleccionar {calendarTarget === 'from' ? 'fecha inicial' : 'fecha final'}
              </Text>
              <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarMonthRow}>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              >
                <Ionicons name="chevron-back" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>{monthTitle}</Text>
              <TouchableOpacity
                style={styles.calendarNavBtn}
                onPress={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              >
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekRow}>
              {WEEKDAY_LABELS.map((d) => (
                <Text key={d} style={styles.calendarWeekLabel}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {calendarCells.map((day, idx) => {
                if (!day) return <View key={`blank-${idx}`} style={styles.calendarDayCell} />;
                const current = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
                const isSelected = calendarTarget === 'from'
                  ? isSameDate(current, fromDateObj)
                  : isSameDate(current, toDateObj);
                return (
                  <TouchableOpacity
                    key={`${calendarMonth.getMonth()}-${day}`}
                    style={[styles.calendarDayCell, isSelected && styles.calendarDayCellActive]}
                    onPress={() => pickCalendarDate(day)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

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
            {reportMode === 'sui' && (
              <Text style={styles.suiExportHint}>
                En modo SUI se incluye automáticamente la sección de campos requeridos SUI.
              </Text>
            )}

            <View style={styles.checkboxGroup}>
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
                  Métricas Globales (KPIs)
                </Text>
              </TouchableOpacity>

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
                  Comparativo Compras / Ventas
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxRow, exportFields.materials && styles.checkboxRowActive]}
                onPress={() => toggleField('materials')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={exportFields.materials ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={exportFields.materials ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.checkboxLabel, exportFields.materials && styles.checkboxLabelActive]}>
                  Distribución por Material
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.checkboxRow, exportFields.recyclers && styles.checkboxRowActive]}
                onPress={() => toggleField('recyclers')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={exportFields.recyclers ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={exportFields.recyclers ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[styles.checkboxLabel, exportFields.recyclers && styles.checkboxLabelActive]}>
                  Top Recicladores
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  exportBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },

  modeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.sm,
  },
  modeBtn: {
    flex: 1,
    height: 40,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  modeBtnText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  modeBtnTextActive: {
    color: theme.colors.textOnPrimary,
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
    marginBottom: theme.spacing.sm,
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
  dateTextInput: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  applyDateRow: {
    paddingHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
  },
  applyDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    height: 40,
    backgroundColor: theme.colors.primaryLight,
  },
  applyDateText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },
  rangeHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  rangeHintText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
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
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  kpiIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ── Secciones ────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  suiCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  suiRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  suiLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  suiValue: {
    maxWidth: '55%',
    textAlign: 'right',
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
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

  // ── Compras / Ventas ─────────────────────────────────────
  flowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  flowIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  flowInfo: { flex: 1 },
  flowLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  flowAmount: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
  },
  compareBarCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  compareBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  barCompra: { backgroundColor: '#E65100' },
  barMargen: { backgroundColor: theme.colors.primary },
  barLegend: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
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
  marginRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
    paddingTop: theme.spacing.lg,
  },

  calendarModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.screen,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  calendarTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  calendarMonthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  calendarMonthTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textTransform: 'capitalize',
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  calendarWeekLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  calendarDayCell: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayCellActive: {
    backgroundColor: theme.colors.primary,
  },
  calendarDayText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textPrimary,
  },
  calendarDayTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.weights.bold,
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
  suiExportHint: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: -theme.spacing.xs,
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
