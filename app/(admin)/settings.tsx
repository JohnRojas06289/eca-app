import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { useAuth } from '@/src/hooks/useAuth';

interface SettingRow {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}

function SettingItem({ icon, label, subtitle, onPress, danger }: SettingRow) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
      <View
        style={[
          styles.settingIconBg,
          danger && styles.settingIconBgDanger,
        ]}
      >
        <Ionicons
          name={icon as any}
          size={18}
          color={danger ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {!danger && (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function AdminSettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const [autoValidate,  setAutoValidate]  = useState(false);
  const [maintenanceMode, setMaintenance] = useState(false);
  const [emailReports,  setEmailReports]  = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajustes</Text>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={theme.colors.badgeAdminText} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>

        {/* ── Perfil del admin ──────────────────────────────── */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? 'AD'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'Administrador'}</Text>
            <Text style={styles.profileRole}>Administrador del Sistema</Text>
            <Text style={styles.profileCedula}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        {/* ── Configuración del sistema ─────────────────────── */}
        <Text style={styles.sectionTitle}>Sistema</Text>
        <View style={styles.card}>
          {/* Auto-validación */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Auto-validar pesajes</Text>
              <Text style={styles.switchSub}>Confirma pesajes sin revisión manual</Text>
            </View>
            <Switch
              value={autoValidate}
              onValueChange={setAutoValidate}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
          <View style={styles.cardDivider} />

          {/* Modo mantenimiento */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Modo mantenimiento</Text>
              <Text style={styles.switchSub}>Bloquea el acceso a recicladores y ciudadanos</Text>
            </View>
            <Switch
              value={maintenanceMode}
              onValueChange={setMaintenance}
              trackColor={{ false: theme.colors.border, true: theme.colors.warning }}
              thumbColor={theme.colors.surface}
            />
          </View>
          <View style={styles.cardDivider} />

          {/* Reportes por email */}
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Reportes semanales por email</Text>
              <Text style={styles.switchSub}>Resumen enviado cada lunes 8:00 AM</Text>
            </View>
            <Switch
              value={emailReports}
              onValueChange={setEmailReports}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* ── Configuración de precios ──────────────────────── */}
        <Text style={styles.sectionTitle}>Precios y Materiales</Text>
        <View style={styles.card}>
          <SettingItem
            icon="pricetag-outline"
            label="Actualizar tabla de precios"
            subtitle="Modifica los precios por kg de cada material"
            onPress={() => {}}
          />
          <View style={styles.cardDivider} />
          <SettingItem
            icon="list-outline"
            label="Gestionar categorías"
            subtitle="Agrega o desactiva tipos de material"
            onPress={() => {}}
          />
        </View>

        {/* ── Rutas y operaciones ───────────────────────────── */}
        <Text style={styles.sectionTitle}>Rutas y Operaciones</Text>
        <View style={styles.card}>
          <SettingItem
            icon="map-outline"
            label="Configurar rutas"
            subtitle="Añadir, editar o eliminar rutas de recolección"
            onPress={() => router.push('/(admin)/routes' as any)}
          />
          <View style={styles.cardDivider} />
          <SettingItem
            icon="time-outline"
            label="Horarios de servicio"
            subtitle="Días y franjas horarias habilitadas"
            onPress={() => {}}
          />
          <View style={styles.cardDivider} />
          <SettingItem
            icon="location-outline"
            label="Zonas de cobertura"
            subtitle="Barrios y sectores atendidos en Zipaquirá"
            onPress={() => {}}
          />
        </View>

        {/* ── Cuenta ────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.card}>
          <SettingItem
            icon="key-outline"
            label="Cambiar contraseña"
            onPress={() => router.push('/(auth)/forgot-password' as any)}
          />
          <View style={styles.cardDivider} />
          <SettingItem
            icon="log-out-outline"
            label="Cerrar Sesión"
            onPress={signOut}
            danger
          />
        </View>

        {/* ── Versión ───────────────────────────────────────── */}
        <Text style={styles.versionText}>ECA App · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.badgeAdminBg,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  adminBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.badgeAdminText,
    letterSpacing: 0.5,
  },

  // ── Perfil ───────────────────────────────────────────────
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  profileAvatar: {
    width: theme.sizes.avatarMd,
    height: theme.sizes.avatarMd,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.badgeAdminBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileAvatarText: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  profileRole: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  profileCedula: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },

  // ── Secciones ────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  cardDivider: {
    height: 1,
    backgroundColor: theme.colors.separator,
    marginLeft: theme.spacing.lg + 36 + theme.spacing.md,
  },

  // ── Filas de ajuste ──────────────────────────────────────
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingIconBgDanger: { backgroundColor: theme.colors.errorLight },
  settingText: { flex: 1 },
  settingLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  settingLabelDanger: { color: theme.colors.error },
  settingSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  // ── Switches ─────────────────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  switchInfo: { flex: 1 },
  switchLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  switchSub: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  // ── Versión ──────────────────────────────────────────────
  versionText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});
