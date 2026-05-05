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
  type OperationalMaterialFamily,
  type OperationalUserType,
  type OperationalVehicleType,
} from '@/src/constants/operationalReport';

interface WeighingFormState {
  recyclerId: string | null;
  microRoute: string;
  linkedUsersCount: string;
  userType: OperationalUserType;
  vehicleType: OperationalVehicleType;
  vehiclePlate: string;
  aforadoToEca: boolean;
  materialFamily: OperationalMaterialFamily;
  materialCode: string;
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

function createInitialForm(firstMicroRoute: string): WeighingFormState {
  const firstMaterial = OPERATIONAL_MATERIAL_CATALOG[0];
  return {
    recyclerId: null,
    microRoute: firstMicroRoute,
    linkedUsersCount: '1',
    userType: 'residencial',
    vehicleType: 'automotor',
    vehiclePlate: '',
    aforadoToEca: true,
    materialFamily: firstMaterial?.family ?? 'Plásticos',
    materialCode: firstMaterial?.code ?? '301',
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

  const recyclers = useMemo(
    () => users.filter((user) => user.role === 'recycler'),
    [users],
  );

  const filteredRecyclers = useMemo(() => {
    const q = cedulaSearch.trim().replace(/\D/g, '');
    if (!q) return recyclers;
    return recyclers.filter((r) => {
      const last3 = String(r.cedula ?? '').replace(/\D/g, '').slice(-3);
      return last3.includes(q);
    });
  }, [recyclers, cedulaSearch]);

  const selectedRecycler =
    recyclers.find((recycler) => recycler.id === form.recyclerId) ?? null;
  const microRouteConfig = getMicroRouteConfig(form.microRoute);
  const macroRoute = microRouteConfig?.macroRoute ?? '1';
  const materialFamilyOptions = Array.from(
    new Set(OPERATIONAL_MATERIAL_CATALOG.map((item) => item.family)),
  );
  const materialOptions = OPERATIONAL_MATERIAL_CATALOG.filter(
    (item) => item.family === form.materialFamily,
  );

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

  function updateForm<K extends keyof WeighingFormState>(
    key: K,
    value: WeighingFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleMaterialFamilyChange(nextFamily: OperationalMaterialFamily) {
    const nextMaterialCode =
      OPERATIONAL_MATERIAL_CATALOG.find((item) => item.family === nextFamily)?.code ??
      form.materialCode;
    setForm((prev) => ({ ...prev, materialFamily: nextFamily, materialCode: nextMaterialCode }));
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
    const linkedUsersCount = Number(form.linkedUsersCount.trim());
    if (!Number.isFinite(linkedUsersCount) || linkedUsersCount <= 0) {
      Alert.alert('Usuarios vinculados', 'Ingresa una cantidad válida de usuarios vinculados.');
      return;
    }
    if (!canSubmit) {
      Alert.alert('Formulario incompleto', 'Completa los campos obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      addRecord({
        macroRoute,
        microRoute: form.microRoute,
        linkedUsersCount: Math.round(linkedUsersCount),
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
      Alert.alert(
        'Entrada registrada',
        'El reporte operativo se actualizó automáticamente con esta entrada.',
        [
          {
            text: 'Ver reporte',
            onPress: () => router.replace('/(admin)/reports' as any),
          },
        ],
      );
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

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
          <Text style={styles.sectionTitle}>Fecha de entrada</Text>
          <TextInput
            value={form.recordDate}
            onChangeText={(v) => updateForm('recordDate', v)}
            placeholder="DD/MM/AAAA"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />

          {/* ── Operador ─────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Operador</Text>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={theme.colors.textMuted} />
            <TextInput
              value={cedulaSearch}
              onChangeText={setCedulaSearch}
              placeholder="Buscar por últimos 3 dígitos de cédula"
              placeholderTextColor={theme.colors.textMuted}
              keyboardType="number-pad"
              maxLength={3}
              style={styles.searchInput}
            />
            {cedulaSearch !== '' && (
              <TouchableOpacity onPress={() => setCedulaSearch('')}>
                <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.recyclerList}>
            {filteredRecyclers.map((recycler) => {
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

          <View style={styles.inputGrid}>
            <View style={styles.inputGridItem}>
              <Text style={styles.fieldLabel}>Usuarios vinculados</Text>
              <TextInput
                value={form.linkedUsersCount}
                onChangeText={(value) => updateForm('linkedUsersCount', value.replace(/\D/g, ''))}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.inputGridItem}>
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
            </View>
          </View>

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
          </ScrollView>

          <Text style={styles.fieldLabel}>Código de material</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {materialOptions.map((material) => {
              const selected = material.code === form.materialCode;
              return (
                <TouchableOpacity
                  key={material.code}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('materialCode', material.code)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {material.code}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Pesaje ───────────────────────────────────── */}
          <Text style={styles.sectionTitle}>Pesaje</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputGridItem}>
              <Text style={styles.fieldLabel}>Cantidad kg</Text>
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
});
