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
  OPERATIONAL_MICRO_ROUTES,
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
  associatedToEca: boolean;
  materialFamily: OperationalMaterialFamily;
  materialCode: string;
  quantityKg: string;
  effectiveKg: string;
  appliesDcto596: boolean;
  note: string;
}

function parseDecimalField(value: string) {
  return Number(value.trim().replace(/\s+/g, '').replace(',', '.'));
}

function createInitialForm(): WeighingFormState {
  const firstRoute = OPERATIONAL_MICRO_ROUTES[0];
  const firstMaterial = OPERATIONAL_MATERIAL_CATALOG[0];

  return {
    recyclerId: null,
    microRoute: firstRoute?.microRoute ?? '1.1',
    linkedUsersCount: '1',
    userType: 'residencial',
    vehicleType: 'automotor',
    vehiclePlate: '',
    associatedToEca: true,
    materialFamily: firstMaterial?.family ?? 'Plásticos',
    materialCode: firstMaterial?.code ?? '301',
    quantityKg: '',
    effectiveKg: '',
    appliesDcto596: true,
    note: '',
  };
}

export default function AdminNewWeighingScreen() {
  const router = useRouter();
  const { users } = useUsers();
  const { settings, addRecord } = useOperationalReports();
  const [form, setForm] = useState<WeighingFormState>(createInitialForm);
  const [loading, setLoading] = useState(false);

  const recyclers = useMemo(
    () => users.filter((user) => user.role === 'recycler'),
    [users],
  );
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
  const selectedMaterial =
    materialOptions.find((item) => item.code === form.materialCode) ?? null;

  const quantityKg = parseDecimalField(form.quantityKg);
  const effectiveKg =
    form.effectiveKg.trim() === ''
      ? quantityKg
      : parseDecimalField(form.effectiveKg);
  const rejectedKg =
    Number.isFinite(quantityKg) && Number.isFinite(effectiveKg)
      ? Math.max(quantityKg - effectiveKg, 0)
      : 0;
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

    setForm((prev) => ({
      ...prev,
      materialFamily: nextFamily,
      materialCode: nextMaterialCode,
    }));
  }

  const canSubmit =
    selectedRecycler !== null &&
    form.microRoute.trim() !== '' &&
    Number.isFinite(quantityKg) &&
    quantityKg > 0 &&
    Number.isFinite(effectiveKg) &&
    effectiveKg >= 0 &&
    effectiveKg <= quantityKg;

  async function handleSubmit() {
    if (!selectedRecycler) {
      Alert.alert('Falta operador', 'Selecciona el reciclador que registrará el pesaje.');
      return;
    }

    const linkedUsersCount = Number(form.linkedUsersCount.trim());
    if (!Number.isFinite(linkedUsersCount) || linkedUsersCount <= 0) {
      Alert.alert(
        'Usuarios vinculados',
        'Ingresa una cantidad válida de usuarios vinculados.',
      );
      return;
    }

    if (form.vehicleType === 'placa' && form.vehiclePlate.trim() === '') {
      Alert.alert('Placa requerida', 'Ingresa la placa del vehículo para este pesaje.');
      return;
    }

    if (!canSubmit) {
      Alert.alert('Formulario incompleto', 'Completa los campos obligatorios del pesaje.');
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
        vehiclePlate:
          form.vehicleType === 'placa'
            ? form.vehiclePlate.trim().toUpperCase()
            : undefined,
        materialCode: form.materialCode,
        quantityKg,
        effectiveKg,
        appliesDcto596: form.appliesDcto596,
        associatedToEca: form.associatedToEca,
      });

      Alert.alert(
        'Pesaje registrado',
        'El reporte operativo se actualizó automáticamente con este pesaje.',
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
          <Text style={styles.headerTitle}>Registrar pesaje</Text>
          <Ionicons name="scale-outline" size={24} color={theme.colors.primary} />
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.info} />
          <Text style={styles.infoBannerText}>
            El reporte operativo tomará automáticamente fecha, NUAP, NUECA, código de
            operador, frecuencia, rechazo y aforado.
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.autoCard}>
            <Text style={styles.sectionTitle}>Campos automáticos</Text>
            <View style={styles.autoGrid}>
              <View style={styles.autoItem}>
                <Text style={styles.autoLabel}>Fecha</Text>
                <Text style={styles.autoValue}>
                  {new Date().toLocaleDateString('es-CO')}
                </Text>
              </View>
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
            </View>
          </View>

          <Text style={styles.sectionTitle}>Operador</Text>
          <View style={styles.recyclerList}>
            {recyclers.map((recycler) => {
              const selected = recycler.id === form.recyclerId;
              return (
                <TouchableOpacity
                  key={recycler.id}
                  style={[styles.recyclerCard, selected && styles.recyclerCardSelected]}
                  onPress={() => updateForm('recyclerId', recycler.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.recyclerAvatar, selected && styles.recyclerAvatarSelected]}>
                    <Text
                      style={[
                        styles.recyclerInitial,
                        selected && styles.recyclerInitialSelected,
                      ]}
                    >
                      {recycler.name[0]}
                    </Text>
                  </View>
                  <View style={styles.recyclerInfo}>
                    <Text style={[styles.recyclerName, selected && styles.recyclerNameSelected]}>
                      {recycler.name}
                    </Text>
                    <Text style={styles.recyclerMeta}>
                      CC {recycler.cedula}
                      {recycler.association ? ` · ${recycler.association}` : ''}
                    </Text>
                  </View>
                  {selected && (
                    <Ionicons name="checkmark-circle" size={22} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Ruta y usuarios</Text>
          <Text style={styles.fieldLabel}>Microruta</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {OPERATIONAL_MICRO_ROUTES.map((route) => {
              const selected = route.microRoute === form.microRoute;
              return (
                <TouchableOpacity
                  key={route.microRoute}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('microRoute', route.microRoute)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    Macro {route.macroRoute} · {route.microRoute}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

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

          <Text style={styles.fieldLabel}>Asociado a la ECA</Text>
          <View style={styles.chipRow}>
            {[
              { value: true, label: 'Sí' },
              { value: false, label: 'No' },
            ].map((option) => {
              const selected = option.value === form.associatedToEca;
              return (
                <TouchableOpacity
                  key={String(option.value)}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('associatedToEca', option.value)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Vehículo y material</Text>
          <Text style={styles.fieldLabel}>Tipo de vehículo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {OPERATIONAL_VEHICLE_TYPES.map((vehicle) => {
              const selected = vehicle.value === form.vehicleType;
              return (
                <TouchableOpacity
                  key={vehicle.value}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => {
                    updateForm('vehicleType', vehicle.value);
                    if (vehicle.value !== 'placa') {
                      updateForm('vehiclePlate', '');
                    }
                  }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {vehicle.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {form.vehicleType === 'placa' && (
            <>
              <Text style={styles.fieldLabel}>Placa</Text>
              <TextInput
                value={form.vehiclePlate}
                onChangeText={(value) => updateForm('vehiclePlate', value.toUpperCase())}
                autoCapitalize="characters"
                placeholder="ABC-123"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </>
          )}

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

          <Text style={styles.fieldLabel}>Material / código</Text>
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
                    {material.code} · {material.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.sectionTitle}>Pesaje</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputGridItem}>
              <Text style={styles.fieldLabel}>Cantidad kg</Text>
              <TextInput
                value={form.quantityKg}
                onChangeText={(value) =>
                  updateForm('quantityKg', value.replace(/[^0-9.,]/g, ''))
                }
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
            <View style={styles.inputGridItem}>
              <Text style={styles.fieldLabel}>Kg aprovechados</Text>
              <TextInput
                value={form.effectiveKg}
                onChangeText={(value) =>
                  updateForm('effectiveKg', value.replace(/[^0-9.,]/g, ''))
                }
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>¿Aplica Dcto 596?</Text>
          <View style={styles.chipRow}>
            {[
              { value: true, label: 'Sí' },
              { value: false, label: 'No' },
            ].map((option) => {
              const selected = option.value === form.appliesDcto596;
              return (
                <TouchableOpacity
                  key={`dcto-${String(option.value)}`}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => updateForm('appliesDcto596', option.value)}
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
            placeholder="Observaciones opcionales del pesaje"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={[styles.input, styles.noteInput]}
          />

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
                  {form.associatedToEca
                    ? microRouteConfig?.frequencyDays.join(', ') || 'No aplica'
                    : 'No aplica'}
                </Text>
              </View>
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Material</Text>
                <Text style={styles.previewValue}>
                  {selectedMaterial
                    ? `${selectedMaterial.name} · ${selectedMaterial.code}`
                    : 'Sin material'}
                </Text>
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
            label="Guardar pesaje y actualizar reporte"
            leftIcon={
              <Ionicons
                name="save-outline"
                size={20}
                color={theme.colors.textOnPrimary}
              />
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
    marginBottom: theme.spacing.lg,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceAlt,
  },
  recyclerAvatarSelected: {
    backgroundColor: theme.colors.primary,
  },
  recyclerInitial: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  recyclerInitialSelected: {
    color: theme.colors.textOnPrimary,
  },
  recyclerInfo: {
    flex: 1,
  },
  recyclerName: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  recyclerNameSelected: {
    color: theme.colors.primaryDark,
  },
  recyclerMeta: {
    marginTop: 2,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  chipText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  chipTextActive: {
    color: theme.colors.primaryDark,
    fontWeight: theme.typography.weights.semibold,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  inputGridItem: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    color: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
  },
  noteInput: {
    minHeight: 88,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
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
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  submitBtn: {
    marginTop: theme.spacing.xl,
  },
});
