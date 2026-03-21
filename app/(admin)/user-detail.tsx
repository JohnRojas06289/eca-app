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
import { MaterialItem } from '@/src/components/MaterialItem';
import type { MaterialType } from '@/src/components/MaterialItem';

type UserStatus = 'active' | 'inactive' | 'pending';

// En producción, los datos vendrán por route params / API:
// const { userId } = useLocalSearchParams();
const MOCK_USER = {
  id: '1',
  name: 'Juan Pérez',
  cedula: '12345678',
  phone: '+57 310 987 6543',
  role: 'recycler' as const,
  status: 'active' as UserStatus,
  association: 'Asociación de Recicladores Zipaquirá',
  joinedAt: 'Enero 2024',
  totalKg: 1250,
  totalRoutes: 42,
  totalValue: 890_000,
};

const RECENT_WEIGHINGS: {
  id: string; material: string; materialType: MaterialType; kg: number; timestamp: string;
}[] = [
  { id: '1', material: 'Plástico PET',       materialType: 'plastic',   kg: 12.5, timestamp: 'Hoy, 10:30 AM'  },
  { id: '2', material: 'Cartón Corrugado',   materialType: 'cardboard', kg: 45.0, timestamp: 'Ayer, 4:15 PM'  },
  { id: '3', material: 'Vidrio Transparente',materialType: 'glass',     kg: 8.2,  timestamp: 'Ayer, 11:20 AM' },
];

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bgColor: string }> = {
  active:   { label: 'Activo',    color: theme.colors.success, bgColor: theme.colors.successLight },
  inactive: { label: 'Inactivo',  color: theme.colors.error,   bgColor: theme.colors.errorLight   },
  pending:  { label: 'Pendiente', color: theme.colors.warning, bgColor: theme.colors.warningLight  },
};

export default function UserDetailScreen() {
  const router = useRouter();
  const [status, setStatus]   = useState<UserStatus>(MOCK_USER.status);
  const [toggling, setToggling] = useState(false);

  const statusCfg = STATUS_CONFIG[status];
  const initials  = MOCK_USER.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  async function toggleStatus() {
    setToggling(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await UserApi.setStatus({ userId: MOCK_USER.id, status: newStatus });
      await new Promise((r) => setTimeout(r, 600));
      setStatus((prev) => (prev === 'active' ? 'inactive' : 'active'));
    } finally {
      setToggling(false);
    }
  }

  function confirmApprove() {
    Alert.alert(
      'Aprobar usuario',
      `¿Aprobar a ${MOCK_USER.name} como reciclador activo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Aprobar', style: 'default', onPress: () => setStatus('active') },
      ],
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
        <Text style={styles.headerTitle}>Detalle de Usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Perfil ────────────────────────────────────────── */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bgColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
            <Text style={[styles.statusLabel, { color: statusCfg.color }]}>
              {statusCfg.label}
            </Text>
          </View>
          <Text style={styles.profileName}>{MOCK_USER.name}</Text>
          <Text style={styles.profileCedula}>CC {MOCK_USER.cedula}</Text>
          {MOCK_USER.association && (
            <View style={styles.assocBadge}>
              <Ionicons name="leaf-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.assocText}>{MOCK_USER.association}</Text>
            </View>
          )}
        </View>

        {/* ── Métricas ──────────────────────────────────────── */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{MOCK_USER.totalKg.toLocaleString('es-CO')}</Text>
            <Text style={styles.metricLabel}>kg recolectados</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{MOCK_USER.totalRoutes}</Text>
            <Text style={styles.metricLabel}>rutas completadas</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              ${(MOCK_USER.totalValue / 1000).toFixed(0)}K
            </Text>
            <Text style={styles.metricLabel}>valor generado</Text>
          </View>
        </View>

        {/* ── Información ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{MOCK_USER.phone}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Registrado</Text>
            <Text style={styles.infoValue}>{MOCK_USER.joinedAt}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>Reciclador</Text>
          </View>
        </View>

        {/* ── Pesajes recientes ─────────────────────────────── */}
        <Text style={styles.sectionTitle}>Pesajes Recientes</Text>
        {RECENT_WEIGHINGS.map((w) => (
          <MaterialItem
            key={w.id}
            name={w.material}
            timestamp={w.timestamp}
            value={`${w.kg} kg`}
            valueColor={theme.colors.primary}
            materialType={w.materialType}
          />
        ))}

        {/* ── Acciones ──────────────────────────────────────── */}
        <View style={styles.actionsSection}>
          {status === 'pending' ? (
            <CustomButton
              label="Aprobar Usuario"
              leftIcon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={theme.colors.textOnPrimary}
                />
              }
              onPress={confirmApprove}
              style={styles.actionBtn}
            />
          ) : (
            <CustomButton
              label={status === 'active' ? 'Desactivar Cuenta' : 'Activar Cuenta'}
              leftIcon={
                <Ionicons
                  name={status === 'active' ? 'ban-outline' : 'checkmark-circle-outline'}
                  size={18}
                  color={status === 'active' ? theme.colors.error : theme.colors.textOnPrimary}
                />
              }
              variant={status === 'active' ? 'secondary' : 'primary'}
              onPress={toggleStatus}
              loading={toggling}
              style={styles.actionBtn}
            />
          )}
        </View>
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

  // ── Perfil ───────────────────────────────────────────────
  profileSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  avatar: {
    width: theme.sizes.avatarXl,
    height: theme.sizes.avatarXl,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.4,
  },
  profileName: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  profileCedula: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  assocBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  assocText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
  },

  // ── Métricas ─────────────────────────────────────────────
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  metricValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },

  // ── Info ─────────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  infoLabel: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: theme.colors.separator,
    marginLeft: theme.spacing.lg + 16 + theme.spacing.md,
  },

  // ── Acciones ─────────────────────────────────────────────
  actionsSection: { marginTop: theme.spacing.xl },
  actionBtn: {},
});
