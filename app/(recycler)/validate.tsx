import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

type MaterialType = 'plastic' | 'cardboard' | 'glass' | 'metals' | 'paper';

interface PendingWeighing {
  id: string;
  adminName: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  pricePerKg: number;
  timestamp: string;
  route: string;
  note?: string;
}

const MATERIAL_CONFIG: Record<MaterialType, { icon: string; color: string; bgColor: string }> = {
  plastic:   { icon: 'water-outline',        color: theme.colors.plastic,   bgColor: theme.colors.plasticBg   },
  cardboard: { icon: 'albums-outline',        color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg },
  glass:     { icon: 'wine-outline',          color: theme.colors.glass,     bgColor: theme.colors.glassBg     },
  metals:    { icon: 'hardware-chip-outline', color: theme.colors.metals,    bgColor: theme.colors.metalsBg    },
  paper:     { icon: 'document-outline',      color: theme.colors.paper,     bgColor: theme.colors.paperBg     },
};

// Mock de pesajes registrados por el admin esperando tu aprobación
const INITIAL_WEIGHINGS: PendingWeighing[] = [
  { id: '1', adminName: 'Carlos Administrador', material: 'Plástico PET',     materialType: 'plastic',   kg: 12.5, pricePerKg: 800,  timestamp: 'Hoy, 10:30 AM', route: 'Centro Histórico' },
  { id: '2', adminName: 'Carlos Administrador', material: 'Cartón Corrugado', materialType: 'cardboard', kg: 45.0, pricePerKg: 350,  timestamp: 'Hoy, 09:15 AM', route: 'Centro Histórico', note: 'Cartón húmedo, se descontó 3 kg' },
  { id: '3', adminName: 'Carlos Administrador', material: 'Aluminio',         materialType: 'metals',    kg: 3.4,  pricePerKg: 2200, timestamp: 'Ayer, 4:30 PM', route: 'San Pablo Norte'   },
];

export default function RecyclerValidateScreen() {
  const router = useRouter();
  const [weighings, setWeighings] = useState<PendingWeighing[]>(INITIAL_WEIGHINGS);
  const [processing, setProcessing] = useState<string | null>(null);

  async function handleApprove(id: string) {
    setProcessing(id);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await WeighingApi.confirm({ id, action: 'approve' });
      await new Promise((r) => setTimeout(r, 700));
      setWeighings((prev) => prev.filter((w) => w.id !== id));
    } finally {
      setProcessing(null);
    }
  }

  function confirmReject(id: string) {
    Alert.alert(
      'Rechazar pesaje',
      '¿Este pesaje no coincide con lo que recolectaste? El administrador recibirá tu rechazo para revisarlo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setProcessing(id);
            try {
              // ⚠️ await WeighingApi.confirm({ id, action: 'reject' });
              await new Promise((r) => setTimeout(r, 600));
              setWeighings((prev) => prev.filter((w) => w.id !== id));
            } finally {
              setProcessing(null);
            }
          },
        },
      ],
    );
  }

  if (weighings.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={router.back}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Revisar Pesajes</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBg}>
            <Ionicons name="checkmark-done-outline" size={40} color={theme.colors.success} />
          </View>
          <Text style={styles.emptyTitle}>Todo revisado</Text>
          <Text style={styles.emptyBody}>No tienes pesajes pendientes de confirmación.</Text>
          <CustomButton
            label="Volver al inicio"
            variant="secondary"
            onPress={router.back}
            style={styles.emptyBtn}
          />
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.headerTitle}>Revisar Pesajes</Text>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingBadgeText}>{weighings.length}</Text>
        </View>
      </View>

      {/* ── Banner informativo ────────────────────────────── */}
      <View style={styles.infoBanner}>
        <Ionicons name="information-circle-outline" size={16} color={theme.colors.info} />
        <Text style={styles.infoBannerText}>
          El administrador registró estos pesajes. Confírmalos si los datos son correctos.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {weighings.map((w) => {
          const mat       = MATERIAL_CONFIG[w.materialType];
          const estimated = Math.round(w.kg * w.pricePerKg);
          const isLoading = processing === w.id;

          return (
            <View key={w.id} style={styles.weighingCard}>
              {/* Cabecera de la tarjeta */}
              <View style={styles.cardHeader}>
                <View style={[styles.matIconBg, { backgroundColor: mat.bgColor }]}>
                  <Ionicons name={mat.icon as any} size={22} color={mat.color} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.materialName}>{w.material}</Text>
                  <Text style={styles.adminName}>Registrado por {w.adminName}</Text>
                </View>
                <View style={styles.kgBadge}>
                  <Text style={styles.kgValue}>{w.kg} kg</Text>
                </View>
              </View>

              {/* Detalles */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>RUTA</Text>
                  <Text style={styles.detailValue}>{w.route}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>HORA</Text>
                  <Text style={styles.detailValue}>{w.timestamp}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>VALOR</Text>
                  <Text style={[styles.detailValue, styles.detailValueGreen]}>
                    ${estimated.toLocaleString('es-CO')}
                  </Text>
                </View>
              </View>

              {/* Nota del administrador */}
              {w.note && (
                <View style={styles.noteRow}>
                  <Ionicons name="chatbubble-outline" size={13} color={theme.colors.warning} />
                  <Text style={styles.noteText}>{w.note}</Text>
                </View>
              )}

              {/* Acciones */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.rejectBtn, isLoading && styles.btnDisabled]}
                  onPress={() => confirmReject(w.id)}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-outline" size={18} color={theme.colors.error} />
                  <Text style={styles.rejectBtnText}>No coincide</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.approveBtn, isLoading && styles.btnDisabled]}
                  onPress={() => handleApprove(w.id)}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <Text style={styles.approveBtnText}>Procesando...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark-outline" size={18} color={theme.colors.textOnPrimary} />
                      <Text style={styles.approveBtnText}>Confirmar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  pendingBadgeText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
  },

  // ── Banner ───────────────────────────────────────────────
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.infoLight,
    marginHorizontal: theme.spacing.screen,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  infoBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.info,
    lineHeight: theme.typography.sizes.small * theme.typography.lineHeights.normal,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Tarjeta de pesaje ────────────────────────────────────
  weighingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  matIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardHeaderInfo: { flex: 1 },
  materialName: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  adminName: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  kgBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexShrink: 0,
  },
  kgValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },

  // ── Detalles ─────────────────────────────────────────────
  detailsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.separator,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  detailItem: { flex: 1 },
  detailLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  detailValueGreen: { color: theme.colors.primary },

  // ── Nota ─────────────────────────────────────────────────
  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.warning,
  },

  // ── Botones de acción ────────────────────────────────────
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
  },
  rejectBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.md,
  },
  approveBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
  btnDisabled: { opacity: 0.6 },

  // ── Estado vacío ─────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  emptyIconBg: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  emptyBody: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyBtn: { marginTop: theme.spacing.xl, width: '100%' },
});
