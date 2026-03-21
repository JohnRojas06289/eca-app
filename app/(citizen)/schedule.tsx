import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { SelectableCard } from '@/src/components/SelectableCard';

const DAYS = [
  { key: 'L', label: 'Lunes' },
  { key: 'M', label: 'Martes' },
  { key: 'X', label: 'Miércoles' },
  { key: 'J', label: 'Jueves' },
  { key: 'V', label: 'Viernes' },
  { key: 'S', label: 'Sábado' },
  { key: 'D', label: 'Domingo' },
];

type WasteType = 'recyclable' | 'organic' | 'non_recyclable';

const SECTORS = [
  'Centro Histórico',
  'San Pablo',
  'El Jardín',
  'La Granja',
  'Algarra III',
  'Villa del Prado',
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [selectedDays, setSelectedDays] = useState<string[]>(['L', 'X', 'V']);
  const [selectedSector, setSelectedSector] = useState('');
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [startTime, setStartTime] = useState('08:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [wasteType, setWasteType] = useState<WasteType>('recyclable');
  const [loading, setLoading] = useState(false);

  function toggleDay(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }

  async function handleSave() {
    setLoading(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await ScheduleApi.save({ sector: selectedSector, days: selectedDays, startTime, endTime, wasteType });
      await new Promise((r) => setTimeout(r, 800));
      router.back();
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
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={router.back}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Configurar Horarios</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Zona / barrio ─────────────────────────────── */}
          <Text style={styles.fieldLabel}>Zona o Barrio de Zipaquirá</Text>
          <TouchableOpacity
            style={styles.dropdownBtn}
            onPress={() => setShowSectorDropdown((v) => !v)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.dropdownText,
                !selectedSector && styles.dropdownPlaceholder,
              ]}
            >
              {selectedSector || 'Seleccionar sector'}
            </Text>
            <Ionicons
              name={showSectorDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.colors.textMuted}
            />
          </TouchableOpacity>
          {showSectorDropdown && (
            <View style={styles.dropdownList}>
              {SECTORS.map((sector) => (
                <TouchableOpacity
                  key={sector}
                  style={[
                    styles.dropdownItem,
                    selectedSector === sector && styles.dropdownItemActive,
                  ]}
                  onPress={() => {
                    setSelectedSector(sector);
                    setShowSectorDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedSector === sector && styles.dropdownItemTextActive,
                    ]}
                  >
                    {sector}
                  </Text>
                  {selectedSector === sector && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Días de recolección ───────────────────────── */}
          <Text style={styles.fieldLabel}>Días de Recolección</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day) => {
              const isSelected = selectedDays.includes(day.key);
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[styles.dayCircle, isSelected && styles.dayCircleActive]}
                  onPress={() => toggleDay(day.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.dayTextActive,
                    ]}
                  >
                    {day.key}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Horarios ──────────────────────────────────── */}
          <View style={styles.timesRow}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>HORA INICIO</Text>
              <TouchableOpacity style={styles.timeBtn}>
                {/* ⚠️ Para selector nativo: npx expo install @react-native-community/datetimepicker */}
                <Text style={styles.timeValue}>{startTime}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.timeBlock}>
              <Text style={styles.timeLabel}>HORA FIN</Text>
              <TouchableOpacity style={styles.timeBtn}>
                <Text style={styles.timeValue}>{endTime}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Tipo de residuo ───────────────────────────── */}
          <Text style={styles.fieldLabel}>Tipo de Residuo</Text>
          <SelectableCard
            layout="list"
            label="Aprovechables"
            subtitle="Plástico, vidrio, cartón"
            icon="sync-circle-outline"
            selected={wasteType === 'recyclable'}
            onPress={() => setWasteType('recyclable')}
          />
          <SelectableCard
            layout="list"
            label="Orgánicos"
            subtitle="Restos de comida, podas"
            icon="leaf-outline"
            iconColor={theme.colors.organic}
            selected={wasteType === 'organic'}
            onPress={() => setWasteType('organic')}
          />
          <SelectableCard
            layout="list"
            label="No Aprovechables"
            subtitle="Papel higiénico, servilletas"
            icon="trash-outline"
            iconColor={theme.colors.textSecondary}
            selected={wasteType === 'non_recyclable'}
            onPress={() => setWasteType('non_recyclable')}
          />

          {/* ── Guardar ───────────────────────────────────── */}
          <CustomButton
            label="Guardar Horario"
            leftIcon={
              <Ionicons
                name="save-outline"
                size={18}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },

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
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },

  // ── Dropdown ─────────────────────────────────────────────
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.inputHeight,
  },
  dropdownText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
  },
  dropdownPlaceholder: { color: theme.colors.textMuted },
  dropdownList: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.xs,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  dropdownItemActive: { backgroundColor: theme.colors.primaryLight },
  dropdownItemText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
  },
  dropdownItemTextActive: { color: theme.colors.primary, fontWeight: theme.typography.weights.semibold },

  // ── Días ─────────────────────────────────────────────────
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  dayCircleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  dayTextActive: { color: theme.colors.textOnPrimary },

  // ── Horarios ─────────────────────────────────────────────
  timesRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  timeBlock: { flex: 1 },
  timeLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: theme.spacing.sm,
  },
  timeBtn: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  timeValue: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  saveBtn: { marginTop: theme.spacing.xxl },
});
