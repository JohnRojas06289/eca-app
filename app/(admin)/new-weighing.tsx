import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { useUsers } from '@/src/context/UsersContext';
import { useOperationalReports } from '@/src/context/OperationalReportsContext';
import {
  OPERATIONAL_MATERIAL_CATALOG,
  OPERATIONAL_USER_TYPES,
  OPERATIONAL_VEHICLE_TYPES,
  buildOperatorCode,
  getMicroRouteConfig,
  getMaterialChildren,
  getOperationalMaterialByCode,
  type OperationalMaterialFamily,
  type OperationalUserType,
  type OperationalVehicleType,
} from '@/src/constants/operationalReport';

interface WeighingFormState {
  recyclerId: string | null;
  microRoute: string;
  userType: OperationalUserType;
  vehicleType: OperationalVehicleType;
  vehiclePlate: string;
  aforadoToEca: boolean;
  materialFamily: OperationalMaterialFamily;
  materialCode: string;
  subFamily: string;
  quantityKg: string;
  rejectedKg: string;
  appliesTarifa596: boolean;
  note: string;
  recordDate: string;
}

function parseDecimalField(value: string) {
  return Number(value.trim().replace(/\s+/g, '').replace(',', '.'));
}

function todayLabel() {
  return new Date().toLocaleDateString('es-CO');
}

/** yyyy-mm-dd → dd/mm/yyyy */
function toDisplayDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/** dd/mm/yyyy → yyyy-mm-dd (para el input HTML type="date") */
function toISODate(display: string): string {
  const parts = display.split('/');
  if (parts.length !== 3 || parts[2].length !== 4) return '';
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}

/** yyyy-mm-dd local sin depender de UTC */
function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function createInitialForm(firstMicroRoute: string): WeighingFormState {
  const firstMaterial = OPERATIONAL_MATERIAL_CATALOG[0];
  return {
    recyclerId: null,
    microRoute: firstMicroRoute,
    userType: 'residencial',
    vehicleType: 'automotor',
    vehiclePlate: '',
    aforadoToEca: true,
    materialFamily: firstMaterial?.family ?? 'Plásticos',
    materialCode: firstMaterial?.code ?? '301',
    subFamily: '',
    quantityKg: '',
    rejectedKg: '',
    appliesTarifa596: true,
    note: '',
    recordDate: todayLabel(),
  };
}

export default function AdminNewWeighingScreen() {
  const router = useRouter();
  const { users } = useUsers();
  const { settings, addRecord, routeConfigs } = useOperationalReports();
  const firstRoute = routeConfigs[0];
  const [form, setForm] = useState<WeighingFormState>(() =>
    createInitialForm(firstRoute?.microRoute ?? '1.1'),
  );
  const [loading, setLoading] = useState(false);
  const [cedulaSearch, setCedulaSearch] = useState('');
  const [showSubfamilies, setShowSubfamilies] = useState(false);
  const [showAllRecyclers, setShowAllRecyclers] = useState(false);
  const [savedSummary, setSavedSummary] = useState<{ operador: string; material: string; kg: string } | null>(null);

  const RECYCLER_PREVIEW_COUNT = 3;

  const recyclers = useMemo(
    () => users.filter((user) => user.role === 'recycler'),
    [users],
  );

  const filteredRecyclers = useMemo(() => {
    const q = cedulaSearch.trim().toLowerCase();
    if (!q) return recyclers;
    return recyclers.filter((r) =>
      String(r.cedula ?? '').toLowerCase().includes(q) ||
      String(r.name ?? '').toLowerCase().includes(q),
    );
  }, [recyclers, cedulaSearch]);

  const selectedRecycler =
    recyclers.find((recycler) => recycler.id === form.recyclerId) ?? null;
  const microRouteConfig = getMicroRouteConfig(form.microRoute);
  const macroRoute = microRouteConfig?.macroRoute ?? '1';
  // Familias disponibles en el selector — excluye 'Especiales' del menú principal
  const materialFamilyOptions = Array.from(
    new Set(
      OPERATIONAL_MATERIAL_CATALOG
        .filter((item) => item.family !== 'Especiales' && !item.parentCode)
        .map((item) => item.family),
    ),
  );
  // Solo ítems raíz (sin parentCode) de la familia seleccionada
  const materialOptions = OPERATIONAL_MATERIAL_CATALOG.filter(
    (item) => item.family === form.materialFamily && !item.parentCode,
  );
  // Código raíz para buscar subfamilias (si el código actual es hijo, sube al padre)
  const effectiveParentCode = form.materialCode.includes('-')
    ? form.materialCode.split('-')[0]
    : form.materialCode;
  const currentMaterialChildren = getMaterialChildren(effectiveParentCode);
  const currentParentMaterial = getOperationalMaterialByCode(effectiveParentCode);

  const quantityKg = parseDecimalField(form.quantityKg);
  const rejectedKg = form.rejectedKg.trim() === '' ? 0 : parseDecimalField(form.rejectedKg);
  const effectiveKg =
    Number.isFinite(quantityKg) && Number.isFinite(rejectedKg)
      ? Math.max(quantityKg - rejectedKg, 0)
      : quantityKg;
  const operatorCode = selectedRecycler
    ? buildOperatorCode(selectedRecycler.name, selectedRecycler.cedula)
    : 'OP-000';
  const isAforado =
    Number.isFinite(quantityKg) && quantityKg >= settings.aforadoThresholdKg;
  const routeReady = form.microRoute.trim() !== '';
  const isSelectedToday = toISODate(form.recordDate) === todayISO();
  const materialReady = form.materialFamily.trim() !== '' && form.materialCode.trim() !== '';
  const weighingReady =
    Number.isFinite(quantityKg) &&
    quantityKg > 0 &&
    Number.isFinite(rejectedKg) &&
    rejectedKg >= 0 &&
    rejectedKg <= quantityKg;
  const progressSteps = [
    { key: 'operator', label: 'Operador', done: selectedRecycler !== null },
    { key: 'route', label: 'Ruta', done: routeReady },
    { key: 'material', label: 'Material', done: materialReady },
    { key: 'weighing', label: 'Pesaje', done: weighingReady },
  ];
  const completedSteps = progressSteps.filter((step) => step.done).length;

  function updateForm<K extends keyof WeighingFormState>(
    key: K,
    value: WeighingFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMaterialFamilyChange(nextFamily: OperationalMaterialFamily) {
    const nextMaterialCode =
      OPERATIONAL_MATERIAL_CATALOG.find((item) => item.family === nextFamily && !item.parentCode)?.code ??
      form.materialCode;
    setForm((prev) => ({ ...prev, materialFamily: nextFamily, materialCode: nextMaterialCode }));
    setShowSubfamilies(false);
  }

  const canSubmit =
    selectedRecycler !== null &&
    form.microRoute.trim() !== '' &&
    Number.isFinite(quantityKg) &&
    quantityKg > 0 &&
    Number.isFinite(rejectedKg) &&
    rejectedKg >= 0 &&
    rejectedKg <= quantityKg;

  async function handleSubmit() {
    if (!selectedRecycler) {
      Alert.alert('Falta operador', 'Selecciona el reciclador que registrará la entrada.');
      return;
    }
    if (!canSubmit) {
      Alert.alert('Formulario incompleto', 'Completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const material = getOperationalMaterialByCode(form.materialCode);
      addRecord({
        macroRoute,
        microRoute: form.microRoute,
        linkedUsersCount: 1,
        userType: form.userType,
        operatorName: selectedRecycler.name,
        operatorIdentification: selectedRecycler.cedula,
        vehicleType: form.vehicleType,
        vehiclePlate: form.vehiclePlate.trim().toUpperCase() || undefined,
        materialCode: form.materialCode,
        quantityKg,
        effectiveKg,
        appliesDcto596: form.appliesTarifa596,
        associatedToEca: form.aforadoToEca,
      });
      setSavedSummary({
        operador: selectedRecycler.name,
        material: material?.name ?? form.materialCode,
        kg: effectiveKg.toLocaleString('es-CO', { maximumFractionDigits: 1 }),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={router.back}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar entrada</Text>
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.info} />
          <Text style={styles.infoBannerText}>
            NUAP, NUECA, código de operador, frecuencia, rechazo y aforado se llenan automáticamente.
          </Text>
        </View>

        {/* ── Banner de confirmación ────────────────────── */}
        {savedSummary && (
          <View style={styles.savedOverlay}>
            <View style={styles.savedCard}>
              <View style={styles.savedIconWrap}>
                <Ionicons name="checkmark-circle" size={48} color={theme.colors.success} />
              </View>
              <Text style={styles.savedTitle}>¡Entrada registrada!</Text>
              <Text style={styles.savedSubtitle}>El registro fue guardado exitosamente.</Text>

              <View style={styles.savedDetails}>
                <View style={styles.savedDetailRow}>
                  <Text style={styles.savedDetailLabel}>Operador</Text>
                  <Text style={styles.savedDetailValue}>{savedSummary.operador}</Text>
                </View>
                <View style={styles.savedDetailRow}>
                  <Text style={styles.savedDetailLabel}>Material</Text>
                  <Text style={styles.savedDetailValue}>{savedSummary.material}</Text>
                </View>
                <View style={styles.savedDetailRow}>
                  <Text style={styles.savedDetailLabel}>Kg efectivos</Text>
                  <Text style={styles.savedDetailValue}>{savedSummary.kg} kg</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.savedBtnPrimary}
                onPress={() => {
                  setSavedSummary(null);
                  setForm(createInitialForm(firstRoute?.microRoute ?? '1.1'));
                  setCedulaSearch('');
                  setShowSubfamilies(false);
                  setShowAllRecyclers(false);
                }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-outline" size={20} color={theme.colors.textOnPrimary} />
                <Text style={styles.savedBtnPrimaryText}>Nuevo registro</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.savedBtnSecondary}
                onPress={() => router.push('/(admin)/reports' as any)}
                activeOpacity={0.8}
              >
                <Ionicons name="bar-chart-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.savedBtnSecondaryText}>Ver reporte</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressIntro}>
                <Text style={styles.progressEyebrow}>Captura guiada</Text>
                <Text style={styles.progressTitle}>Avance del registro</Text>
                <Text style={styles.progressDescription}>
                  Completa los bloques en orden para validar la entrada con menos friccion.
                </Text>
              </View>
              <View style={styles.progressCounter}>
                <Text style={styles.progressCounterValue}>{completedSteps}/4</Text>
                <Text style={styles.progressCounterLabel}>listos</Text>
              </View>
            </View>
            <View style={styles.progressStepRow}>
              {progressSteps.map((step, index) => (
                <View
                  key={step.key}
                  style={[styles.progressStepChip, step.done && styles.progressStepChipDone]}
                >
                  <Text
                    style={[
                      styles.progressStepIndex,
                      step.done && styles.progressStepIndexDone,
                    ]}
                  >
                    {index + 1}
                  </Text>
                  <Text
                    style={[
                      styles.progressStepLabel,
                      step.done && styles.progressStepLabelDone,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Campos automáticos ───────────────────────── */}
          <View style={styles.autoCard}>
            <Text style={styles.sectionTitle}>Campos automáticos</Text>
            <View style={styles.autoGrid}>
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>NUAP</Text>
                <Text style={styles.autoValue}>{settings.nuap}</Text>
              </View>
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>NUECA</Text>
                <Text style={styles.autoValue}>{settings.nueca}</Text>
              </View>
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>Código operador</Text>
                <Text style={styles.autoValue}>{operatorCode}</Text>
              </View>
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>Frecuencia</Text>
                <Text style={styles.autoValue}>
                  {form.aforadoToEca
                    ? microRouteConfig?.frequencyDays.join(', ') || 'N/A'
                    : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Fecha ───────────────────────────────────── */}
          <View style={styles.dateTitleRow}>
            <Text style={styles.sectionTitle}>Fecha de entrada</Text>
            {isSelectedToday && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>Hoy</Text>
              </View>
            )}
          </View>
          <View style={styles.dateRow}>
            {/* Botón calendario a la izquierda — el picker abre hacia el centro */}
            <View style={styles.calendarBtnWrap}>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
              {Platform.OS === 'web' && (
                // @ts-ignore — input HTML nativo, invisible sobre el ícono
                <input
                  type="date"
                  value={toISODate(form.recordDate)}
                  onChange={(e: any) => {
                    if (e.target.value) updateForm('recordDate', toDisplayDate(e.target.value));
                  }}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
              )}
            </View>
            <TextInput
              value={form.recordDate}
              onChangeText={(v) => updateForm('recordDate', v)}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.input, { flex: 1 }]}
            />
          </View>
          <Text style={styles.fieldHint}>(dd/mm/aaaa)</Text>

          {/* ── Operador ─────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Operador *</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
            <TextInput
              value={cedulaSearch}
              onChangeText={setCedulaSearch}
              placeholder="Buscar por cédula o nombre"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="default"
              autoCapitalize="none"
              style={styles.searchInput}
            />
            {cedulaSearch !== '' && (
              <TouchableOpacity onPress={() => setCedulaSearch('')}>
                <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
              )}
          </View>

          {selectedRecycler && (
            <View style={styles.selectedSummaryCard}>
              <View>
                <Text style={styles.selectedSummaryLabel}>Operador seleccionado</Text>
                <Text style={styles.selectedSummaryTitle}>{selectedRecycler.name}</Text>
                <Text style={styles.selectedSummaryMeta}>
                  Codigo {operatorCode}
                  {selectedRecycler.association ? ` · ${selectedRecycler.association}` : ''}
                </Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
            </View>
          )}

          <View style={styles.recyclerList}>
            {(() => {
              const isSearching = cedulaSearch.trim().length > 0;
              const visible =
                isSearching || showAllRecyclers
                  ? filteredRecyclers
                  : filteredRecyclers.slice(0, RECYCLER_PREVIEW_COUNT);
              const hiddenCount = filteredRecyclers.length - RECYCLER_PREVIEW_COUNT;

              return (
                <>
                  {visible.map((recycler) => {
                    const selected = recycler.id === form.recyclerId;
                    const last3 = String(recycler.cedula ?? '').replace(/\D/g, '').slice(-3).padStart(3, '0');
                    return (
                      <TouchableOpacity
                        key={recycler.id}
                        style={[styles.recyclerCard, selected && styles.recyclerCardSelected]}
                        onPress={() => updateForm('recyclerId', recycler.id)}
                        activeOpacity={0.85}
                      >
                        <View style={[styles.recyclerAvatar, selected && styles.recyclerAvatarSelected]}>
                          <Text style={[styles.recyclerInitial, selected && styles.recyclerInitialSelected]}>
                            {recycler.name[0]}
                          </Text>
                        </View>
                        <View style={styles.recyclerInfo}>
                          <Text style={[styles.recyclerName, selected && styles.recyclerNameSelected]}>
                            {recycler.name}
                          </Text>
                          <Text style={styles.recyclerMeta}>
                            ...{last3}
                            {recycler.association ? ` · ${recycler.association}` : ''}
                          </Text>
                        </View>
                        {selected && (
                          <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  {filteredRecyclers.length === 0 && (
                    <Text style={styles.emptyHint}>Sin resultados para "{cedulaSearch}"</Text>
                  )}

                  {!isSearching && hiddenCount > 0 && (
                    <TouchableOpacity
                      style={styles.showMoreBtn}
                      onPress={() => setShowAllRecyclers((v) => !v)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={showAllRecyclers ? 'chevron-up-outline' : 'chevron-down-outline'}
                        size={16}
                        color={theme.colors.primary}
                      />
                      <Text style={styles.showMoreText}>
                        {showAllRecyclers
                          ? 'Ver menos'
                          : `Ver ${hiddenCount} operador${hiddenCount !== 1 ? 'es' : ''} más`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              );
            })()}
          </View>

          {/* ── Ruta ─────────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Ruta y usuarios</Text>
          <Text style={styles.fieldLabel}>Microruta</Text>
          <View style={styles.routeList}>
            {routeConfigs.map((route) => {
              const selected = route.microRoute === form.microRoute;
              return (
                <TouchableOpacity
                  key={route.microRoute}
                  style={[styles.routeRow, selected && styles.routeRowSelected]}
                  onPress={() => updateForm('microRoute', route.microRoute)}
                  activeOpacity={0.85}
                >
                  <View style={styles.routeLeft}>
                    <Text style={[styles.routeCode, selected && styles.routeCodeSelected]}>
                      Macro {route.macroRoute} · {route.microRoute}
                    </Text>
                  </View>
                  <Text style={[styles.routeFrequency, selected && styles.routeFrequencySelected]}>
                    {route.frequencyDays.join(', ')}
                  </Text>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} style={styles.routeCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.inlineStatusRow}>
            <View style={styles.inlineStatusCard}>
              <Text style={styles.inlineStatusLabel}>Macroruta</Text>
              <Text style={styles.inlineStatusValue}>{macroRoute}</Text>
            </View>
            <View style={styles.inlineStatusCard}>
              <Text style={styles.inlineStatusLabel}>Frecuencia</Text>
              <Text style={styles.inlineStatusValue}>
                {form.aforadoToEca ? microRouteConfig?.frequencyDays.join(', ') || 'N/A' : 'No aplica'}
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Tipo de usuario</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {OPERATIONAL_USER_TYPES.map((type) => {
              const selected = type.value === form.userType;
              return (
                <TouchableOpacity
                  key={type.value}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('userType', type.value)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.fieldLabel}>Aforado a la ECA</Text>
          <View style={styles.chipRow}>
            {[
              { value: true, label: 'Sí' },
              { value: false, label: 'No' },
            ].map((option) => {
              const selected = option.value === form.aforadoToEca;
              return (
                <TouchableOpacity
                  key={String(option.value)}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('aforadoToEca', option.value)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Vehículo ─────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Vehículo y material</Text>
          <Text style={styles.fieldLabel}>Tipo de vehículo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {OPERATIONAL_VEHICLE_TYPES.map((vehicle) => {
              const selected = vehicle.value === form.vehicleType;
              return (
                <TouchableOpacity
                  key={vehicle.value}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('vehicleType', vehicle.value)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {vehicle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.fieldLabel}>Placa</Text>
          <TextInput
            value={form.vehiclePlate}
            onChangeText={(value) => updateForm('vehiclePlate', value.toUpperCase())}
            autoCapitalize="characters"
            placeholder="ABC-123 (opcional)"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          {/* ── Material ─────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Familia de material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {materialFamilyOptions.map((family) => {
              const selected = family === form.materialFamily;
              return (
                <TouchableOpacity
                  key={family}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => handleMaterialFamilyChange(family)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {family}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {/* Botón + reemplaza el chip estático "Especiales" */}
            <TouchableOpacity
              style={[styles.chip, showSubfamilies && styles.chipActive]}
              onPress={() => setShowSubfamilies((v) => !v)}
            >
              <Ionicons
                name="add"
                size={16}
                color={showSubfamilies ? theme.colors.textOnPrimary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.fieldLabel}>Código de material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {materialOptions.map((material) => {
              const selected = effectiveParentCode === material.code;
              return (
                <TouchableOpacity
                  key={material.code}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => {
                    updateForm('materialCode', material.code);
                    setShowSubfamilies(false);
                  }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {material.code} · {material.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Subfamilias (panel desplegable vía botón +) ── */}
          {showSubfamilies && (
            <View style={styles.subfamilyPanel}>
              {currentMaterialChildren.length > 0 ? (
                <>
                  <Text style={styles.subfamilyLabel}>
                    Subcategoría de {currentParentMaterial?.name ?? effectiveParentCode}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                    {currentMaterialChildren.map((child) => {
                      const selected = child.code === form.materialCode;
                      return (
                        <TouchableOpacity
                          key={child.code}
                          style={[styles.chip, selected && styles.chipActive]}
                          onPress={() => updateForm('materialCode', child.code)}
                        >
                          <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                            {child.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              ) : (
                <Text style={styles.emptyHint}>
                  Este material no tiene subcategorías definidas.
                </Text>
              )}
            </View>
          )}

          {/* ── Sub familia (texto libre, opcional) ──────── */}
          <View style={styles.optionalLabelRow}>
            <Text style={styles.fieldLabel}>Sub familia</Text>
            <Text style={styles.optionalTag}>opcional</Text>
          </View>
          <TextInput
            value={form.subFamily}
            onChangeText={(v) => updateForm('subFamily', v)}
            placeholder="Ej: PVC Transparente, Pasta dura..."
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          {/* ── Pesaje ───────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Pesaje</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputGridItem}>
              <Text style={styles.fieldLabel}>Cantidad kg *</Text>
              <TextInput
                value={form.quantityKg}
                onChangeText={(value) => updateForm('quantityKg', value.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.inputGridItem}>
              <Text style={styles.fieldLabel}>Kg rechazados</Text>
              <TextInput
                value={form.rejectedKg}
                onChangeText={(value) => updateForm('rejectedKg', value.replace(/[^0-9.,]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inlineStatusRow}>
            <View style={styles.inlineStatusCard}>
              <Text style={styles.inlineStatusLabel}>Neto util</Text>
              <Text style={styles.inlineStatusValue}>
                {Number.isFinite(effectiveKg) ? effectiveKg.toLocaleString('es-CO') : '0'} kg
              </Text>
            </View>
            <View style={styles.inlineStatusCard}>
              <Text style={styles.inlineStatusLabel}>Aforado</Text>
              <Text style={styles.inlineStatusValue}>{isAforado ? 'Si' : 'No'}</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>¿Aplica Tarifa 596?</Text>
          <View style={styles.chipRow}>
            {[
              { value: true, label: 'Sí' },
              { value: false, label: 'No' },
            ].map((option) => {
              const selected = option.value === form.appliesTarifa596;
              return (
                <TouchableOpacity
                  key={`tarifa-${String(option.value)}`}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('appliesTarifa596', option.value)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Nota</Text>
          <TextInput
            value={form.note}
            onChangeText={(value) => updateForm('note', value)}
            placeholder="Observaciones opcionales"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[styles.input, styles.noteInput]}
          />

          {/* ── Vista previa ─────────────────────────────── */}
          <View style={styles.previewCard}>
            <Text style={styles.sectionTitle}>Vista previa automática</Text>
            <View style={styles.previewGrid}>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Operador</Text>
                <Text style={styles.previewValue}>
                  {selectedRecycler?.name ?? 'Selecciona reciclador'}
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Código</Text>
                <Text style={styles.previewValue}>{operatorCode}</Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Macroruta</Text>
                <Text style={styles.previewValue}>{macroRoute}</Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Frecuencia</Text>
                <Text style={styles.previewValue}>
                  {form.aforadoToEca
                    ? microRouteConfig?.frequencyDays.join(', ') || 'No aplica'
                    : 'No aplica'}
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Código material</Text>
                <Text style={styles.previewValue}>{form.materialCode}</Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Rechazo</Text>
                <Text style={styles.previewValue}>
                  {rejectedKg.toLocaleString('es-CO')} kg
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Aforado</Text>
                <Text style={styles.previewValue}>{isAforado ? 'Sí' : 'No'}</Text>
              </View>
            </View>
          </View>

          <CustomButton
            label="Guardar entrada y actualizar reporte"
            leftIcon={
              <Ionicons name="save-outline" size={20} color={theme.colors.textOnPrimary} />
            }
            onPress={handleSubmit}
            loading={loading}
            disabled={!canSubmit}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
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
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.radius.md,
    marginHorizontal: theme.spacing.screen,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.info,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.huge,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  progressIntro: {
    flex: 1,
    gap: 4,
  },
  progressEyebrow: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  progressTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  progressDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  progressCounter: {
    minWidth: 68,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
  },
  progressCounterValue: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryDark,
  },
  progressCounterLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressStepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  progressStepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  progressStepChipDone: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successLight,
  },
  progressStepIndex: {
    width: 20,
    height: 20,
    borderRadius: theme.radius.circle,
    textAlign: 'center',
    lineHeight: 20,
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  progressStepIndexDone: {
    color: theme.colors.success,
  },
  progressStepLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  progressStepLabelDone: {
    color: theme.colors.success,
    fontWeight: theme.typography.weights.semibold,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  autoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  autoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  autoItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  autoLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  autoValue: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    height: theme.sizes.inputHeight,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  selectedSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.success,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  selectedSummaryLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  selectedSummaryTitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  selectedSummaryMeta: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  recyclerList: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  recyclerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  recyclerCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  recyclerAvatar: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recyclerAvatarSelected: { backgroundColor: theme.colors.primary },
  recyclerInitial: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
  },
  recyclerInitialSelected: { color: theme.colors.textOnPrimary },
  recyclerInfo: { flex: 1 },
  recyclerName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  recyclerNameSelected: { color: theme.colors.primary },
  recyclerMeta: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  emptyHint: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  showMoreText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  routeList: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  routeRowSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  routeLeft: { flex: 1 },
  routeCode: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  routeCodeSelected: { color: theme.colors.primary },
  routeFrequency: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    flexShrink: 1,
    textAlign: 'right',
  },
  routeFrequencySelected: { color: theme.colors.primary },
  routeCheck: { marginLeft: theme.spacing.sm },
  inlineStatusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  inlineStatusCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  inlineStatusLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  inlineStatusValue: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  inputGridItem: { flex: 1 },
  input: {
    height: theme.sizes.inputHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  noteInput: {
    height: 80,
    paddingTop: theme.spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.chipHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  chipTextActive: { color: theme.colors.textOnPrimary },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  previewItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  previewLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  previewValue: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  submitBtn: { marginTop: theme.spacing.sm },
  fieldHint: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: theme.spacing.sm,
  },
  dateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  todayBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  todayBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  calendarBtnWrap: {
    width: 44,
    height: theme.sizes.inputHeight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  optionalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  optionalTag: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  subfamilyPanel: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  subfamilyLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  savedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.97)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.screen,
  },
  savedCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.success,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  savedIconWrap: {
    marginBottom: theme.spacing.sm,
  },
  savedTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  savedSubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  savedDetails: {
    width: '100%',
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  savedDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savedDetailLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  savedDetailValue: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  savedBtnPrimary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
  },
  savedBtnPrimaryText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
  savedBtnSecondary: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
  },
  savedBtnSecondaryText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
