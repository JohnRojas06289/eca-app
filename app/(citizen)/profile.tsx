import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { theme } from '@/src/theme/theme';
import { useAuth } from '@/src/hooks/useAuth';

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}

function InfoRow({ icon, label, value, onPress }: InfoRowProps) {
  return (
    <TouchableOpacity
      style={styles.infoRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.infoIconBg}>
        <Ionicons name={icon} size={18} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.textMuted}
        />
      )}
    </TouchableOpacity>
  );
}

export default function CitizenProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const roleLabel =
    user?.role === 'recycler'
      ? 'Reciclador Autorizado'
      : user?.role === 'admin'
      ? 'Administrador'
      : 'Ciudadano';

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
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name="pencil-outline"
            size={22}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sección avatar ────────────────────────────── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>
                  {(user?.name ?? 'U')
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </Text>
              </View>
            )}
            {/* Badge de verificado */}
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={10} color={theme.colors.textOnPrimary} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name ?? 'Usuario'}</Text>
          <Text style={styles.userRole}>{roleLabel}</Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={theme.colors.textMuted}
            />
            <Text style={styles.locationText}>Zipaquirá, Cundinamarca</Text>
          </View>
        </View>

        {/* ── Impacto ambiental ─────────────────────────── */}
        <View style={styles.impactCard}>
          <Text style={styles.impactCardTitle}>IMPACTO AMBIENTAL</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactStat}>
              <View style={styles.impactStatHeader}>
                <Ionicons name="sync-circle-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.impactStatLabel}>Reciclados</Text>
              </View>
              <Text style={styles.impactStatValue}>1.2k kg</Text>
              <View style={styles.impactTrend}>
                <Ionicons name="trending-up" size={12} color={theme.colors.success} />
                <Text style={styles.impactTrendText}>+12% este mes</Text>
              </View>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactStat}>
              <View style={styles.impactStatHeader}>
                <Ionicons name="triangle-outline" size={16} color={theme.colors.primary} />
                <Text style={styles.impactStatLabel}>Árboles</Text>
              </View>
              <Text style={styles.impactStatValue}>350</Text>
              <View style={styles.impactTrend}>
                <Ionicons name="checkmark-circle-outline" size={12} color={theme.colors.success} />
                <Text style={styles.impactTrendText}>Meta superada</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Información personal ──────────────────────── */}
        <Text style={styles.sectionLabel}>INFORMACIÓN PERSONAL</Text>
        <View style={styles.sectionCard}>
          <InfoRow
            icon="id-card-outline"
            label="Cédula"
            value={user?.cedula ?? '1.023.456.789'}
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="call-outline"
            label="Teléfono"
            value={user?.phone ?? '+57 312 456 7890'}
            onPress={() => {}}
          />
          <View style={styles.rowDivider} />
          <InfoRow
            icon="business-outline"
            label="Asociación"
            value={user?.association ?? 'Asorecicladores Zipa'}
            onPress={() => {}}
          />
        </View>

        {/* ── Configuración ─────────────────────────────── */}
        <Text style={styles.sectionLabel}>CONFIGURACIÓN</Text>
        <View style={styles.sectionCard}>
          <InfoRow
            icon="lock-closed-outline"
            label="Cambiar Contraseña"
            value=""
            onPress={() => router.push('/(auth)/forgot-password')}
          />
          <View style={styles.rowDivider} />
          {/* Toggle de notificaciones */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons
                name="notifications-outline"
                size={18}
                color={theme.colors.textSecondary}
              />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Notificaciones</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* ── Cerrar sesión ─────────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.colors.error}
          />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

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

  // ── Avatar ───────────────────────────────────────────────
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: theme.sizes.avatarXl,
    height: theme.sizes.avatarXl,
    borderRadius: theme.radius.circle,
    borderWidth: 3,
    borderColor: theme.colors.primaryMid,
  },
  avatarFallback: {
    width: theme.sizes.avatarXl,
    height: theme.sizes.avatarXl,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 3,
    borderColor: theme.colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  userRole: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  locationText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },

  // ── Impacto ──────────────────────────────────────────────
  impactCard: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  impactCardTitle: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.lg,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactStat: {
    flex: 1,
    alignItems: 'center',
  },
  impactStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  impactStatLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  impactStatValue: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.extrabold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  impactTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  impactTrendText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.medium,
  },
  impactDivider: {
    width: 1,
    height: 60,
    backgroundColor: theme.colors.primaryMid,
  },

  // ── Secciones ────────────────────────────────────────────
  sectionLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  rowDivider: {
    height: 1,
    backgroundColor: theme.colors.separator,
    marginLeft: theme.spacing.lg + 36 + theme.spacing.md,
  },

  // ── Cerrar sesión ────────────────────────────────────────
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
  },
  signOutText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
  },
});
