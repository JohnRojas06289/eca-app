import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

type WeightStatus = 'idle' | 'measuring' | 'stable' | 'error';
type MaterialKey  = 'plastic' | 'cardboard' | 'glass' | 'metals' | 'organic' | 'paper';

interface MaterialOption {
  key: MaterialKey;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  pricePerKg: number;
}

const MATERIALS: MaterialOption[] = [
  { key: 'plastic',   name: 'Plástico PET',  icon: 'water-outline',        color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   pricePerKg: 800  },
  { key: 'cardboard', name: 'Cartón',         icon: 'albums-outline',        color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, pricePerKg: 350  },
  { key: 'glass',     name: 'Vidrio',         icon: 'wine-outline',          color: theme.colors.glass,     bgColor: theme.colors.glassBg,     pricePerKg: 120  },
  { key: 'metals',    name: 'Metales',        icon: 'hardware-chip-outline', color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    pricePerKg: 2200 },
  { key: 'organic',   name: 'Orgánicos',      icon: 'leaf-outline',          color: theme.colors.organic,   bgColor: theme.colors.organicBg,   pricePerKg: 0    },
  { key: 'paper',     name: 'Papel',          icon: 'document-outline',      color: theme.colors.paper,     bgColor: theme.colors.paperBg,     pricePerKg: 500  },
];

const STATUS_CONFIG: Record<WeightStatus, { label: string; color: string; dotColor: string }> = {
  idle:      { label: 'En espera',   color: theme.colors.textMuted,  dotColor: theme.colors.textMuted  },
  measuring: { label: 'Midiendo...', color: theme.colors.warning,    dotColor: theme.colors.warning    },
  stable:    { label: 'Estable',     color: theme.colors.success,    dotColor: theme.colors.success    },
  error:     { label: 'Error',       color: theme.colors.error,      dotColor: theme.colors.error      },
};

export default function WeighingStationScreen() {
  const router = useRouter();
  const [status,           setStatus]           = useState<WeightStatus>('idle');
  const [weight,           setWeight]           = useState(0.0);
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialKey>('plastic');
  const [saving,           setSaving]           = useState(false);

  const blinkAnim = useRef(new Animated.Value(1)).current;

  const material   = MATERIALS.find((m) => m.key === selectedMaterial)!;
  const estimated  = Math.round(weight * material.pricePerKg);
  const statusCfg  = STATUS_CONFIG[status];

  // Simula parpadeo del punto de estado cuando midiendo
  useEffect(() => {
    if (status === 'measuring') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.2, duration: 500, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1,   duration: 500, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      blinkAnim.setValue(1);
      return undefined;
    }
  }, [status, blinkAnim]);

  // Simula lectura de báscula
  function startMeasure() {
    setStatus('measuring');
    setWeight(0.0);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      // ⚠️ Reemplazar con lectura real del hardware Bluetooth/USB:
      // const reading = await ScaleDevice.read();
      const simulated = parseFloat((Math.random() * 0.5 + 12.2).toFixed(2));
      setWeight(simulated);
      if (elapsed >= 2000) {
        clearInterval(interval);
        setWeight(12.5);
        setStatus('stable');
      }
    }, 100);
  }

  function clearScale() {
    setStatus('idle');
    setWeight(0.0);
  }

  async function saveWeighing() {
    setSaving(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await WeighingApi.create({ material: selectedMaterial, kg: weight });
      await new Promise((r) => setTimeout(r, 800));
      router.replace('/(recycler)/weighings');
    } finally {
      setSaving(false);
    }
  }

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
        <Text style={styles.headerTitle}>Estación de Pesaje</Text>
        <Ionicons name="bluetooth-outline" size={24} color={theme.colors.info} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Display de báscula ────────────────────────── */}
        <View style={styles.scaleDisplay}>
          {/* Indicador de estado */}
          <View style={styles.statusRow}>
            <Animated.View
              style={[
                styles.statusDot,
                { backgroundColor: statusCfg.dotColor, opacity: blinkAnim },
              ]}
            />
            <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>

          {/* Lectura principal */}
          <Text style={styles.weightDisplay}>
            {weight.toFixed(2)}
          </Text>
          <Text style={styles.weightUnit}>KG</Text>

          {/* Línea de material seleccionado */}
          <View style={[styles.materialBadge, { backgroundColor: material.bgColor }]}>
            <Ionicons name={material.icon as any} size={14} color={material.color} />
            <Text style={[styles.materialBadgeText, { color: material.color }]}>
              {material.name}
            </Text>
          </View>
        </View>

        {/* ── Acciones báscula ──────────────────────────── */}
        <View style={styles.scaleActions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={clearScale}
            disabled={status === 'idle'}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.actionBtnLabelSecondary}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.actionBtnPrimary,
              status === 'measuring' && styles.actionBtnDisabled,
            ]}
            onPress={startMeasure}
            disabled={status === 'measuring'}
          >
            <Ionicons name="play-outline" size={20} color={theme.colors.textOnPrimary} />
            <Text style={styles.actionBtnLabelPrimary}>Medir</Text>
          </TouchableOpacity>
        </View>

        {/* ── Valor estimado ────────────────────────────── */}
        {weight > 0 && (
          <View style={styles.estimatedCard}>
            <Text style={styles.estimatedLabel}>Valor estimado</Text>
            <Text style={styles.estimatedValue}>
              ${estimated.toLocaleString('es-CO')}
            </Text>
            <Text style={styles.estimatedRate}>
              ${material.pricePerKg.toLocaleString('es-CO')}/kg
            </Text>
          </View>
        )}

        {/* ── Selector de material ──────────────────────── */}
        <Text style={styles.sectionTitle}>Categoría de Material</Text>
        <View style={styles.materialsGrid}>
          {MATERIALS.map((mat) => {
            const isSelected = selectedMaterial === mat.key;
            return (
              <TouchableOpacity
                key={mat.key}
                style={[
                  styles.matCard,
                  { borderColor: isSelected ? mat.color : theme.colors.border },
                  isSelected && { backgroundColor: mat.bgColor },
                ]}
                onPress={() => setSelectedMaterial(mat.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={mat.icon as any}
                  size={20}
                  color={isSelected ? mat.color : theme.colors.textMuted}
                />
                <Text
                  style={[
                    styles.matName,
                    isSelected && { color: mat.color, fontWeight: theme.typography.weights.semibold },
                  ]}
                >
                  {mat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Guardar pesaje ────────────────────────────── */}
        <CustomButton
          label="Guardar Pesaje"
          leftIcon={
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={theme.colors.textOnPrimary}
            />
          }
          onPress={saveWeighing}
          loading={saving}
          disabled={status !== 'stable' || weight <= 0}
          style={styles.saveBtn}
        />
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

  // ── Display báscula ──────────────────────────────────────
  scaleDisplay: {
    backgroundColor: theme.colors.textPrimary,
    borderRadius: theme.radius.xxl,
    paddingVertical: theme.spacing.xxxl,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
  },
  weightDisplay: {
    fontSize: theme.typography.sizes.display,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
    fontVariant: ['tabular-nums'],
    lineHeight: theme.typography.sizes.display * 1.1,
  },
  weightUnit: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.medium,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: theme.spacing.xl,
  },
  materialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  materialBadgeText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },

  // ── Acciones ─────────────────────────────────────────────
  scaleActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    height: theme.sizes.buttonHeight,
  },
  actionBtnPrimary: { backgroundColor: theme.colors.primary },
  actionBtnSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnLabelPrimary: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
  actionBtnLabelSecondary: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },

  // ── Estimado ─────────────────────────────────────────────
  estimatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  estimatedLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  estimatedValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  estimatedRate: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Categorías ───────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  materialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  matCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  matName: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  saveBtn: {},
});
