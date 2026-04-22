import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

type MaterialKey = 'plastic' | 'cardboard' | 'glass' | 'metals' | 'organic' | 'paper' | 'rcd' | 'waste';

interface Material {
  key: MaterialKey;
  name: string;
  unit: string;
  icon: string;
  color: string;
  bgColor: string;
  pricePerKg: number;
}

const MATERIALS: Material[] = [
  { key: 'plastic',   name: 'Plástico PET',       unit: 'kg', icon: 'water-outline',          color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   pricePerKg: 800  },
  { key: 'cardboard', name: 'Cartón Corrugado',   unit: 'kg', icon: 'albums-outline',          color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, pricePerKg: 350  },
  { key: 'glass',     name: 'Vidrio',             unit: 'kg', icon: 'wine-outline',            color: theme.colors.glass,     bgColor: theme.colors.glassBg,     pricePerKg: 120  },
  { key: 'metals',    name: 'Metales',            unit: 'kg', icon: 'hardware-chip-outline',   color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    pricePerKg: 2200 },
  { key: 'organic',   name: 'Orgánicos',          unit: 'kg', icon: 'leaf-outline',            color: theme.colors.organic,   bgColor: theme.colors.organicBg,   pricePerKg: 0    },
  { key: 'paper',     name: 'Papel Archivo',      unit: 'kg', icon: 'document-outline',        color: theme.colors.paper,     bgColor: theme.colors.paperBg,     pricePerKg: 500  },
  { key: 'rcd',       name: 'RCD (Construcción)', unit: 'kg', icon: 'hammer-outline',          color: theme.colors.rcd,       bgColor: theme.colors.rcdBg,       pricePerKg: 0    },
  { key: 'waste',     name: 'Rechazo',            unit: 'kg', icon: 'trash-bin-outline',       color: theme.colors.waste,     bgColor: theme.colors.wasteBg,     pricePerKg: 0    },
];

export default function NewWeighingScreen() {
  const router = useRouter();
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialKey | null>(null);
  const [kg, setKg]       = useState('');
  const [note, setNote]   = useState('');
  const [loading, setLoading] = useState(false);

  const material = MATERIALS.find((m) => m.key === selectedMaterial);
  const kgNum    = parseFloat(kg) || 0;
  const estimated = material ? Math.round(kgNum * material.pricePerKg) : 0;

  const canSubmit = selectedMaterial !== null && kgNum > 0;

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await WeighingApi.create({ material: selectedMaterial, kg: kgNum, note });
      await new Promise((r) => setTimeout(r, 800));
      router.replace('/(recycler)/weighings');
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
        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={router.back}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Pesaje</Text>
          <Ionicons name="scale-outline" size={24} color={theme.colors.primary} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Selección de material ─────────────────────── */}
          <Text style={styles.fieldLabel}>Tipo de Material</Text>
          <View style={styles.materialsGrid}>
            {MATERIALS.map((mat) => {
              const isSelected = selectedMaterial === mat.key;
              return (
                <TouchableOpacity
                  key={mat.key}
                  style={[
                    styles.materialCard,
                    { borderColor: isSelected ? mat.color : theme.colors.border },
                    isSelected && { backgroundColor: mat.bgColor },
                  ]}
                  onPress={() => setSelectedMaterial(mat.key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.materialIconBg, { backgroundColor: mat.bgColor }]}>
                    <Ionicons name={mat.icon as any} size={22} color={mat.color} />
                  </View>
                  <Text
                    style={[
                      styles.materialName,
                      isSelected && { color: mat.color },
                    ]}
                    numberOfLines={2}
                  >
                    {mat.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.materialCheck, { backgroundColor: mat.color }]}>
                      <Ionicons name="checkmark" size={12} color={theme.colors.textOnPrimary} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Kilogramos ────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Cantidad (kg)</Text>
          <View style={styles.kgInputWrapper}>
            <TextInput
              style={styles.kgInput}
              value={kg}
              onChangeText={(v) => setKg(v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={styles.kgUnit}>kg</Text>
          </View>

          {/* ── Valor estimado ────────────────────────────── */}
          {material && kgNum > 0 && (
            <View style={styles.estimatedCard}>
              <View>
                <Text style={styles.estimatedLabel}>Valor estimado</Text>
                <Text style={styles.estimatedValue}>
                  ${estimated.toLocaleString('es-CO')}
                </Text>
              </View>
              <Text style={styles.estimatedRate}>
                ${material.pricePerKg.toLocaleString('es-CO')}/kg
              </Text>
            </View>
          )}

          {/* ── Nota opcional ─────────────────────────────── */}
          <Text style={styles.fieldLabel}>
            Nota <Text style={styles.optionalTag}>(opcional)</Text>
          </Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Ej: Material húmedo, requiere secado..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* ── Ir a báscula ──────────────────────────────── */}
          <CustomButton
            label="Guardar Pesaje"
            leftIcon={
              <Ionicons
                name="checkmark-done-outline"
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
  optionalTag: {
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textMuted,
  },

  // ── Grilla materiales ────────────────────────────────────
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  materialCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
    position: 'relative',
    ...theme.shadows.sm,
  },
  materialIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  materialName: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  materialCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Input kg ─────────────────────────────────────────────
  kgInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.inputHeight * 1.4,
  },
  kgInput: {
    flex: 1,
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  kgUnit: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
    marginLeft: theme.spacing.sm,
  },

  // ── Estimado ─────────────────────────────────────────────
  estimatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  estimatedLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
    marginBottom: 2,
  },
  estimatedValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  estimatedRate: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },

  // ── Nota ─────────────────────────────────────────────────
  noteInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    minHeight: 90,
  },

  submitBtn: { marginTop: theme.spacing.xxl },
});
