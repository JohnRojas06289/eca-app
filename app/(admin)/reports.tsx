import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
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
import { useOperationalReports } from '@/src/context/OperationalReportsContext';
import {
  OPERATIONAL_MATERIAL_CATALOG,
  OPERATIONAL_MICRO_ROUTES,
  OPERATIONAL_USER_TYPES,
  OPERATIONAL_VEHICLE_TYPES,
  buildOperatorCode,
  createOperationalReportRecord,
  getMicroRouteConfig,
  toOperationalReportRecordInput,
  type OperationalMaterialFamily,
  type OperationalReportRecordInput,
  type OperationalReportSettings,
  type OperationalReportRecord,
  type OperationalUserType,
  type OperationalVehicleType,
} from '@/src/constants/operationalReport';

type Period = 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ReportMode = 'sui' | 'internal' | 'operational';
type ExecutiveReportMode = Exclude<ReportMode, 'operational'>;

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

interface OperationalFormState {
  macroRoute: string;
  microRoute: string;
  linkedUsersCount: string;
  userType: OperationalUserType;
  operatorName: string;
  operatorIdentification: string;
  vehicleType: OperationalVehicleType;
  vehiclePlate: string;
  associatedToEca: boolean;
  materialFamily: OperationalMaterialFamily;
  materialCode: string;
  quantityKg: string;
  effectiveKg: string;
  appliesDcto596: boolean;
  forceAforado: boolean;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week',    label: 'Semana'    },
  { key: 'month',   label: 'Mes'       },
  { key: 'quarter', label: 'Trimestre' },
  { key: 'year',    label: 'Año'       },
  { key: 'custom',  label: 'Personalizado' },
];

const REPORT_DATASETS: Record<ExecutiveReportMode, ReportDataset> = {
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

function parseRecordDate(value: string): Date {
  return new Date(value);
}

function formatOperationalVehicle(value: OperationalReportRecord['vehicleType']) {
  if (value === 'automotor') return 'Automotor';
  if (value === 'placa') return 'Placa';
  return 'Tracción humana';
}

function formatOperationalUserType(value: OperationalUserType) {
  return OPERATIONAL_USER_TYPES.find((option) => option.value === value)?.label ?? value;
}

function parseDecimalField(value: string) {
  const normalized = value.trim().replace(/\s+/g, '').replace(',', '.');
  return Number(normalized);
}

function mapRecordToOperationalInput(record: OperationalReportRecord): OperationalReportRecordInput {
  return toOperationalReportRecordInput(record);
}

function createInitialOperationalForm(): OperationalFormState {
  const firstRoute = OPERATIONAL_MICRO_ROUTES[0];
  const firstMaterial = OPERATIONAL_MATERIAL_CATALOG[0];

  return {
    macroRoute: firstRoute?.macroRoute ?? '1',
    microRoute: firstRoute?.microRoute ?? '1.1',
    linkedUsersCount: '1',
    userType: 'residencial',
    operatorName: '',
    operatorIdentification: '',
    vehicleType: 'automotor',
    vehiclePlate: '',
    associatedToEca: true,
    materialFamily: firstMaterial?.family ?? 'Plásticos',
    materialCode: firstMaterial?.code ?? '303',
    quantityKg: '',
    effectiveKg: '',
    appliesDcto596: true,
    forceAforado: false,
  };
}

export default function AdminReportsScreen() {
  const router = useRouter();
  const {
    settings: operationalSettings,
    setSettings: setOperationalSettings,
    recordInputs: operationalRecordInputs,
    setRecordInputs: setOperationalRecordInputs,
    records: operationalRows,
    routeConfigs,
  } = useOperationalReports();
  const today = new Date();
  const [period, setPeriod] = useState<Period>('month');
  const [reportMode, setReportMode] = useState<ReportMode>('operational');
  const [exporting, setExporting] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [operationalForm, setOperationalForm] = useState<OperationalFormState>(
    createInitialOperationalForm,
  );

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  const [exportFields, setExportFields] = useState({
    kpi: true,
    financial: true,
    materials: true,
    recyclers: true,
    summary: true,
    records: true,
    catalog: true,
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
  const [macroRouteFilter, setMacroRouteFilter] = useState<'all' | string>('all');
  const [microRouteFilter, setMicroRouteFilter] = useState<'all' | string>('all');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | OperationalUserType>('all');
  const [materialFamilyFilter, setMaterialFamilyFilter] = useState<'all' | OperationalMaterialFamily>('all');
  const [aforadoFilter, setAforadoFilter] = useState<'all' | 'si' | 'no'>('all');
  const [operatorCodeQuery, setOperatorCodeQuery] = useState('');

  const toggleField = (field: keyof typeof exportFields) => {
    setExportFields((prev) => ({ ...prev, [field]: !prev[field] }));
  };
  const now = new Date();
  const data = REPORT_DATASETS[reportMode === 'operational' ? 'internal' : reportMode];
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
  const operationalStartDate = parseDateLabel(dateFrom);
  const operationalEndDate = parseDateLabel(dateTo);
  const macroRouteOptions = Array.from(new Set(routeConfigs.map((item) => item.macroRoute)));
  const microRouteOptions = routeConfigs
    .filter((item) => macroRouteFilter === 'all' || item.macroRoute === macroRouteFilter)
    .map((item) => item.microRoute);
  const materialFamilyOptions = Array.from(
    new Set(OPERATIONAL_MATERIAL_CATALOG.map((item) => item.family)),
  );

  const filteredOperationalRows = useMemo(() => {
    return operationalRows.filter((row) => {
      const rowDate = parseRecordDate(row.createdAt);
      const startOk = operationalStartDate ? rowDate >= operationalStartDate : true;
      const endBoundary = operationalEndDate
        ? new Date(
            operationalEndDate.getFullYear(),
            operationalEndDate.getMonth(),
            operationalEndDate.getDate(),
            23,
            59,
            59,
            999,
          )
        : null;
      const endOk = endBoundary ? rowDate <= endBoundary : true;
      const macroOk = macroRouteFilter === 'all' || row.macroRoute === macroRouteFilter;
      const microOk = microRouteFilter === 'all' || row.microRoute === microRouteFilter;
      const userTypeOk = userTypeFilter === 'all' || row.userType === userTypeFilter;
      const materialOk =
        materialFamilyFilter === 'all' || row.materialFamily === materialFamilyFilter;
      const aforadoOk =
        aforadoFilter === 'all' ||
        (aforadoFilter === 'si' ? row.isAforado : !row.isAforado);
      const operatorOk =
        operatorCodeQuery.trim() === '' ||
        row.operatorCode.toLowerCase().includes(operatorCodeQuery.trim().toLowerCase());

      return (
        startOk &&
        endOk &&
        macroOk &&
        microOk &&
        userTypeOk &&
        materialOk &&
        aforadoOk &&
        operatorOk
      );
    });
  }, [
    aforadoFilter,
    macroRouteFilter,
    materialFamilyFilter,
    microRouteFilter,
    operationalEndDate,
    operationalRows,
    operationalStartDate,
    operatorCodeQuery,
    userTypeFilter,
  ]);

  const operationalFormMicroRouteOptions = routeConfigs.filter(
    (item) => item.macroRoute === operationalForm.macroRoute,
  );
  const operationalFormMaterialOptions = OPERATIONAL_MATERIAL_CATALOG.filter(
    (item) => item.family === operationalForm.materialFamily,
  );
  const operationalFormMicroRouteConfig = getMicroRouteConfig(operationalForm.microRoute);
  const operationalFormOperatorCode = buildOperatorCode(
    operationalForm.operatorName,
    operationalForm.operatorIdentification,
  );
  const operationalFormQuantityKg = parseDecimalField(operationalForm.quantityKg);
  const operationalFormEffectiveKg =
    operationalForm.effectiveKg.trim() === ''
      ? operationalFormQuantityKg
      : parseDecimalField(operationalForm.effectiveKg);
  const operationalFormRejectedKg =
    Number.isFinite(operationalFormQuantityKg) && Number.isFinite(operationalFormEffectiveKg)
      ? Math.max(operationalFormQuantityKg - operationalFormEffectiveKg, 0)
      : 0;
  const operationalFormIsAforado =
    operationalForm.forceAforado ||
    (Number.isFinite(operationalFormQuantityKg) &&
      operationalFormQuantityKg >= operationalSettings.aforadoThresholdKg);

  const operationalSummary = useMemo(
    () => ({
      totalRecords: filteredOperationalRows.length,
      totalKg: filteredOperationalRows.reduce((sum, row) => sum + row.quantityKg, 0),
      totalRejectedKg: filteredOperationalRows.reduce((sum, row) => sum + row.rejectedKg, 0),
      totalAforados: filteredOperationalRows.filter((row) => row.isAforado).length,
      totalTarifa596: filteredOperationalRows.filter((row) => row.appliesDcto596).length,
    }),
    [filteredOperationalRows],
  );

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

  function updateOperationalForm<K extends keyof OperationalFormState>(
    key: K,
    value: OperationalFormState[K],
  ) {
    setOperationalForm((prev) => ({ ...prev, [key]: value }));
  }

  function openOperationalRecordModal() {
    setOperationalForm(createInitialOperationalForm());
    setRecordModalVisible(true);
  }

  function handleOperationalSettingsChange<K extends keyof OperationalReportSettings>(
    key: K,
    value: OperationalReportSettings[K],
  ) {
    setOperationalSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleOperationalMacroChange(nextMacroRoute: string) {
    const fallbackMicroRoute =
      OPERATIONAL_MICRO_ROUTES.find((item) => item.macroRoute === nextMacroRoute)?.microRoute ??
      operationalForm.microRoute;

    setOperationalForm((prev) => ({
      ...prev,
      macroRoute: nextMacroRoute,
      microRoute: fallbackMicroRoute,
    }));
  }

  function handleOperationalMicroRouteChange(nextMicroRoute: string) {
    const routeConfig = getMicroRouteConfig(nextMicroRoute);

    setOperationalForm((prev) => ({
      ...prev,
      microRoute: nextMicroRoute,
      macroRoute: routeConfig?.macroRoute ?? prev.macroRoute,
    }));
  }

  function handleOperationalMaterialFamilyChange(nextFamily: OperationalMaterialFamily) {
    const nextMaterialCode =
      OPERATIONAL_MATERIAL_CATALOG.find((item) => item.family === nextFamily)?.code ??
      operationalForm.materialCode;

    setOperationalForm((prev) => ({
      ...prev,
      materialFamily: nextFamily,
      materialCode: nextMaterialCode,
    }));
  }

  function handleSaveOperationalRecord() {
    const operatorName = operationalForm.operatorName.trim();
    const operatorIdentificationDigits = operationalForm.operatorIdentification.replace(/\D/g, '');
    const quantityKg = parseDecimalField(operationalForm.quantityKg);
    const effectiveKg =
      operationalForm.effectiveKg.trim() === ''
        ? quantityKg
        : parseDecimalField(operationalForm.effectiveKg);
    const linkedUsersCount = Number(operationalForm.linkedUsersCount.trim());

    if (!operatorName) {
      Alert.alert('Formulario incompleto', 'Ingresa el nombre del operador.');
      return;
    }

    if (operatorIdentificationDigits.length < 5) {
      Alert.alert(
        'Identificación inválida',
        'Ingresa un número de identificación válido para el operador.',
      );
      return;
    }

    if (!Number.isFinite(linkedUsersCount) || linkedUsersCount <= 0) {
      Alert.alert(
        'Usuarios vinculados',
        'Ingresa una cantidad válida mayor a 0 para usuarios vinculados.',
      );
      return;
    }

    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
      Alert.alert('Cantidad inválida', 'Ingresa una cantidad de kilogramos válida.');
      return;
    }

    if (!Number.isFinite(effectiveKg) || effectiveKg < 0) {
      Alert.alert('Kg aprovechados', 'Ingresa un valor válido para los kg aprovechados.');
      return;
    }

    if (effectiveKg > quantityKg) {
      Alert.alert(
        'Rechazo inválido',
        'Los kg aprovechados no pueden ser mayores a la cantidad total en kg.',
      );
      return;
    }

    const newRecord: OperationalReportRecordInput = {
      id: `op-${Date.now()}`,
      createdAt: new Date().toISOString(),
      macroRoute: operationalForm.macroRoute,
      microRoute: operationalForm.microRoute,
      linkedUsersCount: Math.round(linkedUsersCount),
      userType: operationalForm.userType,
      operatorName,
      operatorIdentification: operatorIdentificationDigits,
      vehicleType: operationalForm.vehicleType,
      vehiclePlate: operationalForm.vehiclePlate.trim().toUpperCase() || undefined,
      materialCode: operationalForm.materialCode,
      quantityKg,
      effectiveKg,
      appliesDcto596: operationalForm.appliesDcto596,
      forceAforado: operationalForm.forceAforado,
      associatedToEca: operationalForm.associatedToEca,
    };

    setOperationalRecordInputs((prev) => [newRecord, ...prev]);
    setRecordModalVisible(false);
    setOperationalForm(createInitialOperationalForm());
    Alert.alert(
      'Registro agregado',
      'El registro operativo quedó listo para previsualizar y exportar.',
    );
  }

  function buildExportData() {
    if (reportMode === 'operational') {
      return {
        title: operationalSettings.reportName,
        dateRange: `${dateFrom} → ${dateTo}`,
        fields: exportFields,
        reportMode,
        operationalData: {
          filters: {
            NUAP: operationalSettings.nuap,
            NUECA: operationalSettings.nueca,
            Macroruta: macroRouteFilter === 'all' ? 'Todas' : macroRouteFilter,
            Microruta: microRouteFilter === 'all' ? 'Todas' : microRouteFilter,
            'Tipo de usuario': userTypeFilter === 'all' ? 'Todos' : userTypeFilter,
            'Familia material':
              materialFamilyFilter === 'all' ? 'Todas' : materialFamilyFilter,
            Aforado: aforadoFilter === 'all' ? 'Todos' : aforadoFilter,
            'Código operador': operatorCodeQuery.trim() || 'Todos',
            'Umbral aforado':
              `${operationalSettings.aforadoThresholdKg.toLocaleString('es-CO')} kg`,
          },
          summary: { ...operationalSummary, totalDcto596: operationalSummary.totalTarifa596 },
          records: filteredOperationalRows,
          materialsCatalog: OPERATIONAL_MATERIAL_CATALOG,
        },
      };
    }

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
            {reportMode === 'operational'
              ? operationalSettings.reportName
              : reportMode === 'sui'
                ? 'Modo SUI'
                : 'Modo Interno'}{' '}
            · Corte: {formatDateTime(now)}
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
          style={[styles.modeBtn, reportMode === 'operational' && styles.modeBtnActive]}
          onPress={() => setReportMode('operational')}
          activeOpacity={0.85}
        >
          <Text style={[styles.modeBtnText, reportMode === 'operational' && styles.modeBtnTextActive]}>
            Reporte operativo
          </Text>
        </TouchableOpacity>
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
        {reportMode === 'operational' ? (
          <>
            <Text style={styles.sectionTitle}>Configuración del reporte operativo</Text>
            <View style={styles.operationalConfigCard}>
              <Text style={styles.operationalFormLabel}>Nombre del reporte</Text>
              <TextInput
                value={operationalSettings.reportName}
                onChangeText={(value) => handleOperationalSettingsChange('reportName', value)}
                placeholder="Reporte operativo"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.operationalFormInput}
              />

              <View style={styles.operationalFormGrid}>
                <View style={styles.operationalFormGridItem}>
                  <Text style={styles.operationalFormLabel}>NUAP</Text>
                  <TextInput
                    value={operationalSettings.nuap}
                    onChangeText={(value) => handleOperationalSettingsChange('nuap', value)}
                    placeholder="NUAP-001"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.operationalFormInput}
                  />
                </View>
                <View style={styles.operationalFormGridItem}>
                  <Text style={styles.operationalFormLabel}>NUECA</Text>
                  <TextInput
                    value={operationalSettings.nueca}
                    onChangeText={(value) => handleOperationalSettingsChange('nueca', value)}
                    placeholder="NUECA-001"
                    placeholderTextColor={theme.colors.textMuted}
                    style={styles.operationalFormInput}
                  />
                </View>
              </View>

              <Text style={styles.operationalFormLabel}>Umbral aforado (kg)</Text>
              <TextInput
                value={String(operationalSettings.aforadoThresholdKg)}
                onChangeText={(value) =>
                  handleOperationalSettingsChange(
                    'aforadoThresholdKg',
                    Number(value.replace(/\D/g, '')) || 0,
                  )
                }
                keyboardType="number-pad"
                placeholder="50"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.operationalFormInput}
              />
              <Text style={styles.operationalFormHelper}>
                Si un registro supera este umbral, el sistema lo marcará como aforado.
              </Text>
            </View>

            <View style={styles.operationalActionRow}>
              <View style={styles.operationalActionInfo}>
                <Text style={styles.operationalActionTitle}>Registros cargados</Text>
                <Text style={styles.operationalActionSubtitle}>
                  {operationalRows.length} registros listos. La mayoría de campos se llenan automáticamente desde el pesaje.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.operationalPrimaryAction}
                onPress={() => router.push('/(admin)/new-weighing' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={18} color={theme.colors.textOnPrimary} />
                <Text style={styles.operationalPrimaryActionText}>Registrar entrada</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Filtros operativos</Text>
            <View style={styles.operationalFilterCard}>
              <TextInput
                value={operatorCodeQuery}
                onChangeText={setOperatorCodeQuery}
                placeholder="Buscar por código de operador"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.operationalSearchInput}
              />

              <Text style={styles.operationalFilterLabel}>Macroruta</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                <TouchableOpacity
                  style={[styles.operationalChip, macroRouteFilter === 'all' && styles.operationalChipActive]}
                  onPress={() => {
                    setMacroRouteFilter('all');
                    setMicroRouteFilter('all');
                  }}
                >
                  <Text style={[styles.operationalChipText, macroRouteFilter === 'all' && styles.operationalChipTextActive]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {macroRouteOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.operationalChip, macroRouteFilter === option && styles.operationalChipActive]}
                    onPress={() => {
                      setMacroRouteFilter(option);
                      setMicroRouteFilter('all');
                    }}
                  >
                    <Text style={[styles.operationalChipText, macroRouteFilter === option && styles.operationalChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.operationalFilterLabel}>Microruta</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                <TouchableOpacity
                  style={[styles.operationalChip, microRouteFilter === 'all' && styles.operationalChipActive]}
                  onPress={() => setMicroRouteFilter('all')}
                >
                  <Text style={[styles.operationalChipText, microRouteFilter === 'all' && styles.operationalChipTextActive]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {microRouteOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.operationalChip, microRouteFilter === option && styles.operationalChipActive]}
                    onPress={() => setMicroRouteFilter(option)}
                  >
                    <Text style={[styles.operationalChipText, microRouteFilter === option && styles.operationalChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.operationalFilterLabel}>Tipo de usuario</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                <TouchableOpacity
                  style={[styles.operationalChip, userTypeFilter === 'all' && styles.operationalChipActive]}
                  onPress={() => setUserTypeFilter('all')}
                >
                  <Text style={[styles.operationalChipText, userTypeFilter === 'all' && styles.operationalChipTextActive]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                {OPERATIONAL_USER_TYPES.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.operationalChip, userTypeFilter === option.value && styles.operationalChipActive]}
                    onPress={() => setUserTypeFilter(option.value)}
                  >
                    <Text style={[styles.operationalChipText, userTypeFilter === option.value && styles.operationalChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.operationalFilterLabel}>Familia material</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                <TouchableOpacity
                  style={[styles.operationalChip, materialFamilyFilter === 'all' && styles.operationalChipActive]}
                  onPress={() => setMaterialFamilyFilter('all')}
                >
                  <Text style={[styles.operationalChipText, materialFamilyFilter === 'all' && styles.operationalChipTextActive]}>
                    Todas
                  </Text>
                </TouchableOpacity>
                {materialFamilyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[styles.operationalChip, materialFamilyFilter === option && styles.operationalChipActive]}
                    onPress={() => setMaterialFamilyFilter(option)}
                  >
                    <Text style={[styles.operationalChipText, materialFamilyFilter === option && styles.operationalChipTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.operationalFilterLabel}>Aforado</Text>
              <View style={styles.operationalChipRow}>
                {[
                  { value: 'all' as const, label: 'Todos' },
                  { value: 'si' as const, label: 'Sí' },
                  { value: 'no' as const, label: 'No' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.operationalChip, aforadoFilter === option.value && styles.operationalChipActive]}
                    onPress={() => setAforadoFilter(option.value)}
                  >
                    <Text style={[styles.operationalChipText, aforadoFilter === option.value && styles.operationalChipTextActive]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.sectionTitle}>Resumen del reporte</Text>
            <View style={styles.operationalSummaryGrid}>
              <View style={styles.operationalSummaryCard}>
                <Text style={styles.operationalSummaryValue}>{operationalSummary.totalRecords}</Text>
                <Text style={styles.operationalSummaryLabel}>Registros</Text>
              </View>
              <View style={styles.operationalSummaryCard}>
                <Text style={styles.operationalSummaryValue}>
                  {operationalSummary.totalKg.toLocaleString('es-CO')} kg
                </Text>
                <Text style={styles.operationalSummaryLabel}>Cantidad total</Text>
              </View>
              <View style={styles.operationalSummaryCard}>
                <Text style={styles.operationalSummaryValue}>
                  {operationalSummary.totalRejectedKg.toLocaleString('es-CO')} kg
                </Text>
                <Text style={styles.operationalSummaryLabel}>Rechazo</Text>
              </View>
              <View style={styles.operationalSummaryCard}>
                <Text style={styles.operationalSummaryValue}>{operationalSummary.totalAforados}</Text>
                <Text style={styles.operationalSummaryLabel}>Aforados</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Vista previa del reporte</Text>
            {filteredOperationalRows.length === 0 ? (
              <View style={styles.operationalEmptyCard}>
                <Ionicons name="document-text-outline" size={28} color={theme.colors.textMuted} />
                <Text style={styles.operationalEmptyTitle}>Sin resultados</Text>
                <Text style={styles.operationalEmptyText}>
                  Ajusta los filtros o crea un nuevo registro para verlo aquí y exportarlo.
                </Text>
              </View>
            ) : (
              filteredOperationalRows.map((row) => (
                <View key={row.id} style={styles.operationalRecordCard}>
                  <View style={styles.operationalRecordHeader}>
                    <View>
                      <Text style={styles.operationalRecordTitle}>
                        {row.operatorCode} · {row.operatorName}
                      </Text>
                      <Text style={styles.operationalRecordSubtitle}>
                        {new Date(row.createdAt).toLocaleDateString('es-CO')} · Macroruta {row.macroRoute} / Microruta {row.microRoute}
                      </Text>
                    </View>
                    <View style={[styles.operationalBadge, row.isAforado && styles.operationalBadgeActive]}>
                      <Text style={[styles.operationalBadgeText, row.isAforado && styles.operationalBadgeTextActive]}>
                        {row.isAforado ? 'Aforado' : 'Estándar'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.operationalFieldGrid}>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>NUAP</Text>
                      <Text style={styles.operationalFieldValue}>{row.nuap}</Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>NUECA</Text>
                      <Text style={styles.operationalFieldValue}>{row.nueca}</Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Usuarios vinculados</Text>
                      <Text style={styles.operationalFieldValue}>{row.linkedUsersCount}</Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Tipo usuario</Text>
                      <Text style={styles.operationalFieldValue}>{row.userType}</Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Identificación</Text>
                      <Text style={styles.operationalFieldValue}>{row.operatorIdentification}</Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Vehículo</Text>
                      <Text style={styles.operationalFieldValue}>
                        {formatOperationalVehicle(row.vehicleType)}
                        {row.vehiclePlate ? ` · ${row.vehiclePlate}` : ''}
                      </Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Frecuencia</Text>
                      <Text style={styles.operationalFieldValue}>
                        {row.frequencyDays.join(', ') || 'No aplica'}
                      </Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Código material</Text>
                      <Text style={styles.operationalFieldValue}>{row.materialCode}</Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Cantidad kg</Text>
                      <Text style={styles.operationalFieldValue}>
                        {row.quantityKg.toLocaleString('es-CO')}
                      </Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Rechazo</Text>
                      <Text style={styles.operationalFieldValue}>
                        {row.rejectedKg.toLocaleString('es-CO')} kg
                      </Text>
                    </View>
                    <View style={styles.operationalFieldItem}>
                      <Text style={styles.operationalFieldLabel}>Tarifa 596</Text>
                      <Text style={styles.operationalFieldValue}>
                        {row.appliesDcto596 ? 'Sí' : 'No'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}

            <Text style={styles.sectionTitle}>Catálogo de materiales</Text>
            <View style={styles.operationalCatalogCard}>
              {materialFamilyOptions.map((family) => {
                const familyItems = OPERATIONAL_MATERIAL_CATALOG.filter((item) => item.family === family);
                return (
                  <View key={family} style={styles.operationalCatalogSection}>
                    <Text style={styles.operationalCatalogTitle}>{family}</Text>
                    <View style={styles.operationalCatalogChips}>
                      {familyItems.map((item) => (
                        <View key={item.code} style={styles.operationalCatalogChip}>
                          <Text style={styles.operationalCatalogCode}>{item.code}</Text>
                          <Text style={styles.operationalCatalogName}>{item.name}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <>
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

            <Text style={styles.sectionTitle}>Distribución por Material</Text>
            <View style={styles.materialCard}>
              {MATERIAL_STATS.map((mat, index) => (
                <View key={mat.name}>
                  <View style={styles.materialRow}>
                    <View style={[styles.materialIconBg, { backgroundColor: mat.bgColor }]}>
                      <Ionicons name={mat.icon as any} size={18} color={mat.color} />
                    </View>
                    <View style={styles.materialInfo}>
                      <View style={styles.materialLabelRow}>
                        <Text style={styles.materialName}>{mat.name}</Text>
                        <Text style={styles.materialKg}>{mat.kg.toLocaleString('es-CO')} kg</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${mat.percentage}%`, backgroundColor: mat.color },
                          ]}
                        />
                      </View>
                    </View>
                    <Text style={[styles.materialPercent, { color: mat.color }]}>
                      {mat.percentage}%
                    </Text>
                  </View>
                  {index < MATERIAL_STATS.length - 1 && <View style={styles.divider} />}
                </View>
              ))}
            </View>

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
          </>
        )}
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

      <Modal
        visible={recordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRecordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.operationalModalContent]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Nuevo registro operativo</Text>
                <Text style={styles.operationalModalSubtitle}>
                  Llena el formulario y el registro quedará listo para exportar.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.operationalModalScroll}
            >
              <View style={styles.operationalFormSection}>
                <Text style={styles.operationalFormSectionTitle}>Campos automáticos</Text>
                <View style={styles.operationalAutoGrid}>
                  <View style={styles.operationalAutoItem}>
                    <Text style={styles.operationalAutoLabel}>Fecha</Text>
                    <Text style={styles.operationalAutoValue}>
                      {new Date().toLocaleDateString('es-CO')}
                    </Text>
                  </View>
                  <View style={styles.operationalAutoItem}>
                    <Text style={styles.operationalAutoLabel}>Código operador</Text>
                    <Text style={styles.operationalAutoValue}>{operationalFormOperatorCode}</Text>
                  </View>
                  <View style={styles.operationalAutoItem}>
                    <Text style={styles.operationalAutoLabel}>Frecuencia</Text>
                    <Text style={styles.operationalAutoValue}>
                      {operationalForm.associatedToEca
                        ? operationalFormMicroRouteConfig?.frequencyDays.join(', ') || 'No aplica'
                        : 'No aplica'}
                    </Text>
                  </View>
                  <View style={styles.operationalAutoItem}>
                    <Text style={styles.operationalAutoLabel}>Rechazo estimado</Text>
                    <Text style={styles.operationalAutoValue}>
                      {operationalFormRejectedKg.toLocaleString('es-CO')} kg
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.operationalFormSection}>
                <Text style={styles.operationalFormSectionTitle}>Configuración base</Text>
                <View style={styles.operationalFormGrid}>
                  <View style={styles.operationalFormGridItem}>
                    <Text style={styles.operationalFormLabel}>NUAP</Text>
                    <TextInput
                      value={operationalSettings.nuap}
                      onChangeText={(value) => handleOperationalSettingsChange('nuap', value)}
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.operationalFormInput}
                    />
                  </View>
                  <View style={styles.operationalFormGridItem}>
                    <Text style={styles.operationalFormLabel}>NUECA</Text>
                    <TextInput
                      value={operationalSettings.nueca}
                      onChangeText={(value) => handleOperationalSettingsChange('nueca', value)}
                      placeholderTextColor={theme.colors.textMuted}
                      style={styles.operationalFormInput}
                    />
                  </View>
                </View>

                <Text style={styles.operationalFormLabel}>Macroruta</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                  {macroRouteOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.operationalChip, operationalForm.macroRoute === option && styles.operationalChipActive]}
                      onPress={() => handleOperationalMacroChange(option)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.macroRoute === option && styles.operationalChipTextActive]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.operationalFormLabel}>Microruta</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                  {operationalFormMicroRouteOptions.map((option) => (
                    <TouchableOpacity
                      key={option.microRoute}
                      style={[styles.operationalChip, operationalForm.microRoute === option.microRoute && styles.operationalChipActive]}
                      onPress={() => handleOperationalMicroRouteChange(option.microRoute)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.microRoute === option.microRoute && styles.operationalChipTextActive]}>
                        {option.microRoute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.operationalFormLabel}>Aforado a la ECA</Text>
                <View style={styles.operationalChipRow}>
                  {[
                    { value: true, label: 'Sí' },
                    { value: false, label: 'No' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={String(option.value)}
                      style={[styles.operationalChip, operationalForm.associatedToEca === option.value && styles.operationalChipActive]}
                      onPress={() => updateOperationalForm('associatedToEca', option.value)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.associatedToEca === option.value && styles.operationalChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.operationalFormSection}>
                <Text style={styles.operationalFormSectionTitle}>Operador</Text>
                <Text style={styles.operationalFormLabel}>Nombre del operador</Text>
                <TextInput
                  value={operationalForm.operatorName}
                  onChangeText={(value) => updateOperationalForm('operatorName', value)}
                  placeholder="Ej. Juan Pérez"
                  placeholderTextColor={theme.colors.textMuted}
                  style={styles.operationalFormInput}
                />

                <View style={styles.operationalFormGrid}>
                  <View style={styles.operationalFormGridItem}>
                    <Text style={styles.operationalFormLabel}>Identificación</Text>
                    <TextInput
                      value={operationalForm.operatorIdentification}
                      onChangeText={(value) => updateOperationalForm('operatorIdentification', value)}
                      placeholder="Cédula"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="number-pad"
                      style={styles.operationalFormInput}
                    />
                  </View>
                  <View style={styles.operationalFormGridItem}>
                    <Text style={styles.operationalFormLabel}>Usuarios vinculados</Text>
                    <TextInput
                      value={operationalForm.linkedUsersCount}
                      onChangeText={(value) => updateOperationalForm('linkedUsersCount', value)}
                      placeholder="1"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="number-pad"
                      style={styles.operationalFormInput}
                    />
                  </View>
                </View>

                <Text style={styles.operationalFormLabel}>Tipo de usuario</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                  {OPERATIONAL_USER_TYPES.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.operationalChip, operationalForm.userType === option.value && styles.operationalChipActive]}
                      onPress={() => updateOperationalForm('userType', option.value)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.userType === option.value && styles.operationalChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.operationalFormSection}>
                <Text style={styles.operationalFormSectionTitle}>Vehículo y material</Text>
                <Text style={styles.operationalFormLabel}>Tipo de vehículo</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                  {OPERATIONAL_VEHICLE_TYPES.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[styles.operationalChip, operationalForm.vehicleType === option.value && styles.operationalChipActive]}
                      onPress={() => updateOperationalForm('vehicleType', option.value)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.vehicleType === option.value && styles.operationalChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.operationalFormLabel}>Placa</Text>
                <TextInput
                  value={operationalForm.vehiclePlate}
                  onChangeText={(value) => updateOperationalForm('vehiclePlate', value.toUpperCase())}
                  placeholder="ABC-123 (opcional)"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                  style={styles.operationalFormInput}
                />

                <Text style={styles.operationalFormLabel}>Familia de material</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                  {materialFamilyOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.operationalChip, operationalForm.materialFamily === option && styles.operationalChipActive]}
                      onPress={() => handleOperationalMaterialFamilyChange(option)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.materialFamily === option && styles.operationalChipTextActive]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.operationalFormLabel}>Código de material</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.operationalChipRow}>
                  {operationalFormMaterialOptions.map((option) => (
                    <TouchableOpacity
                      key={option.code}
                      style={[styles.operationalChip, operationalForm.materialCode === option.code && styles.operationalChipActive]}
                      onPress={() => updateOperationalForm('materialCode', option.code)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.materialCode === option.code && styles.operationalChipTextActive]}>
                        {option.code}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.operationalFormSection}>
                <Text style={styles.operationalFormSectionTitle}>Pesaje</Text>
                <View style={styles.operationalFormGrid}>
                  <View style={styles.operationalFormGridItem}>
                    <Text style={styles.operationalFormLabel}>Cantidad kg</Text>
                    <TextInput
                      value={operationalForm.quantityKg}
                      onChangeText={(value) => updateOperationalForm('quantityKg', value)}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="decimal-pad"
                      style={styles.operationalFormInput}
                    />
                  </View>
                  <View style={styles.operationalFormGridItem}>
                    <Text style={styles.operationalFormLabel}>Kg rechazados</Text>
                    <TextInput
                      value={operationalForm.effectiveKg}
                      onChangeText={(value) => updateOperationalForm('effectiveKg', value)}
                      placeholder="0"
                      placeholderTextColor={theme.colors.textMuted}
                      keyboardType="decimal-pad"
                      style={styles.operationalFormInput}
                    />
                  </View>
                </View>

                <Text style={styles.operationalFormLabel}>¿Aplica Tarifa 596?</Text>
                <View style={styles.operationalChipRow}>
                  {[
                    { value: true, label: 'Sí' },
                    { value: false, label: 'No' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={`dcto-${String(option.value)}`}
                      style={[styles.operationalChip, operationalForm.appliesDcto596 === option.value && styles.operationalChipActive]}
                      onPress={() => updateOperationalForm('appliesDcto596', option.value)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.appliesDcto596 === option.value && styles.operationalChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.operationalFormLabel}>Aforado manual</Text>
                <View style={styles.operationalChipRow}>
                  {[
                    { value: false, label: 'Automático' },
                    { value: true, label: 'Forzar sí' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={`aforado-${String(option.value)}`}
                      style={[styles.operationalChip, operationalForm.forceAforado === option.value && styles.operationalChipActive]}
                      onPress={() => updateOperationalForm('forceAforado', option.value)}
                    >
                      <Text style={[styles.operationalChipText, operationalForm.forceAforado === option.value && styles.operationalChipTextActive]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.operationalStatusCard}>
                  <Text style={styles.operationalStatusTitle}>Vista rápida del registro</Text>
                  <Text style={styles.operationalStatusText}>
                    {formatOperationalUserType(operationalForm.userType)} ·{' '}
                    {formatOperationalVehicle(operationalForm.vehicleType)} ·{' '}
                    {operationalFormIsAforado ? 'Aforado' : 'Estándar'}
                  </Text>
                  <Text style={styles.operationalStatusText}>
                    Material seleccionado: {operationalForm.materialCode}
                  </Text>
                  <Text style={styles.operationalStatusText}>
                    Rechazo calculado: {operationalFormRejectedKg.toLocaleString('es-CO')} kg
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View style={styles.operationalModalActions}>
              <TouchableOpacity
                style={styles.operationalSecondaryAction}
                onPress={() => setRecordModalVisible(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.operationalSecondaryActionText}>Cancelar</Text>
              </TouchableOpacity>
              <CustomButton
                label="Guardar registro"
                onPress={handleSaveOperationalRecord}
                style={styles.operationalModalSubmit}
                leftIcon={
                  <Ionicons
                    name="save-outline"
                    size={18}
                    color={theme.colors.textOnPrimary}
                  />
                }
              />
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
            {reportMode === 'operational' && (
              <Text style={styles.suiExportHint}>
                En el reporte operativo se exportan los filtros aplicados y puedes incluir resumen,
                detalle de registros y catálogo de materiales.
              </Text>
            )}

            <View style={styles.checkboxGroup}>
              {reportMode === 'operational' ? (
                <>
                  <TouchableOpacity
                    style={[styles.checkboxRow, exportFields.summary && styles.checkboxRowActive]}
                    onPress={() => toggleField('summary')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={exportFields.summary ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={exportFields.summary ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text style={[styles.checkboxLabel, exportFields.summary && styles.checkboxLabelActive]}>
                      Resumen operativo
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.checkboxRow, exportFields.records && styles.checkboxRowActive]}
                    onPress={() => toggleField('records')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={exportFields.records ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={exportFields.records ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text style={[styles.checkboxLabel, exportFields.records && styles.checkboxLabelActive]}>
                      Registros detallados
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.checkboxRow, exportFields.catalog && styles.checkboxRowActive]}
                    onPress={() => toggleField('catalog')}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={exportFields.catalog ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={exportFields.catalog ? theme.colors.primary : theme.colors.textMuted}
                    />
                    <Text style={[styles.checkboxLabel, exportFields.catalog && styles.checkboxLabelActive]}>
                      Catálogo de materiales
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
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
                </>
              )}
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

  // ── Reporte operativo ───────────────────────────────────
  operationalConfigCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  operationalFormGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  operationalFormGridItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  operationalFormLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  operationalFormInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceAlt,
  },
  operationalFormHelper: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  operationalConfigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  operationalConfigLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  operationalConfigValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  operationalActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  operationalActionInfo: {
    flex: 1,
    minWidth: 220,
  },
  operationalActionTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  operationalActionSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  operationalPrimaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    minHeight: 44,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  operationalPrimaryActionText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
  operationalFilterCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  operationalSearchInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surfaceAlt,
    marginBottom: theme.spacing.sm,
  },
  operationalFilterLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: theme.spacing.sm,
  },
  operationalChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  operationalChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
  },
  operationalChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  operationalChipText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  operationalChipTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: theme.typography.weights.semibold,
  },
  operationalSummaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  operationalSummaryCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
  },
  operationalSummaryValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xs,
  },
  operationalSummaryLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  operationalEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xxxl,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  operationalEmptyTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  operationalEmptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.body,
  },
  operationalRecordCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  operationalRecordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  operationalRecordTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  operationalRecordSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  operationalBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  operationalBadgeActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  operationalBadgeText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  operationalBadgeTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: theme.typography.weights.semibold,
  },
  operationalFieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  operationalFieldItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  operationalFieldLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  operationalFieldValue: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  operationalCatalogCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  operationalCatalogSection: {
    gap: theme.spacing.sm,
  },
  operationalCatalogTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  operationalCatalogChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  operationalCatalogChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    minWidth: 120,
  },
  operationalCatalogCode: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    marginBottom: 2,
  },
  operationalCatalogName: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textPrimary,
  },
  operationalModalContent: {
    maxHeight: '94%',
  },
  operationalModalSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  operationalModalScroll: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  operationalFormSection: {
    gap: theme.spacing.sm,
  },
  operationalFormSectionTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  operationalAutoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  operationalAutoItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  operationalAutoLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  operationalAutoValue: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  operationalStatusCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  operationalStatusTitle: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primaryDark,
  },
  operationalStatusText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primaryDark,
  },
  operationalModalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  operationalSecondaryAction: {
    flex: 1,
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  operationalSecondaryActionText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  operationalModalSubmit: {
    flex: 1,
  },

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
