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
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.infoIconBg}>
        <Ionicons name={icon} size={18} color={theme.colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
      {onPress && (
        <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function RecyclerProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [notifRoute,   setNotifRoute]   = useState(true);
  const [notifWeigh,   setNotifWeigh]   = useState(true);
  const [notifPrices,  setNotifPrices]  = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'Reciclador';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Cabecera de perfil ────────────────────────── */}
        <View style={styles.profileHeader}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {firstName[0]?.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Badge de rol */}
          <View style={styles.roleBadge}>
            <Ionicons name="refresh-circle-outline" size={12} color={theme.colors.badgeRecyclerText} />
            <Text style={styles.roleBadgeText}>RECICLADOR</Text>
          </View>

          <Text style={styles.profileName}>{user?.name ?? 'Reciclador'}</Text>
          <Text style={styles.profileCedula}>
            {user?.cedula ? `CC ${user.cedula}` : 'Sin cédula registrada'}
          </Text>

          {/* Asociación */}
          {user?.association && (
            <View style={styles.associationBadge}>
              <Ionicons name="leaf-outline" size={13} color={theme.colors.primary} />
              <Text style={styles.associationText}>{user.association}</Text>
            </View>
          )}
        </View>

        {/* ── Tarjeta de impacto ────────────────────────── */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Mi Impacto</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>1.250</Text>
              <Text style={styles.impactUnit}>kg recolectados</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>42</Text>
              <Text style={styles.impactUnit}>rutas completadas</Text>
            </View>
            <View style={styles.impactDivider} />
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>3</Text>
              <Text style={styles.impactUnit}>años activo</Text>
            </View>
          </View>
        </View>

        {/* ── Información personal ──────────────────────── */}
        <Text style={styles.sectionTitle}>Información Personal</Text>
        <View style={styles.card}>
          <InfoRow
            icon="person-outline"
            label="Nombre completo"
            value={user?.name ?? '—'}
          />
          <View style={styles.cardDivider} />
          <InfoRow
            icon="call-outline"
            label="Teléfono"
            value={user?.phone ?? '—'}
            onPress={() => {}}
          />
          <View style={styles.cardDivider} />
          <InfoRow
            icon="card-outline"
            label="Cédula"
            value={user?.cedula ?? '—'}
          />
        </View>

        {/* ── Notificaciones ────────────────────────────── */}
        <Text style={styles.sectionTitle}>Notificaciones</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Alertas de ruta</Text>
              <Text style={styles.switchSub}>Cambios en paradas y recorrido</Text>
            </View>
            <Switch
              value={notifRoute}
              onValueChange={setNotifRoute}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Confirmación de pesajes</Text>
              <Text style={styles.switchSub}>Cuando el sistema confirme tu registro</Text>
            </View>
            <Switch
              value={notifWeigh}
              onValueChange={setNotifWeigh}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
          <View style={styles.cardDivider} />
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.switchLabel}>Actualización de precios</Text>
              <Text style={styles.switchSub}>Cambios en la tabla de precios</Text>
            </View>
            <Switch
              value={notifPrices}
              onValueChange={setNotifPrices}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.surface}
            />
          </View>
        </View>

        {/* ── Acciones ──────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Cuenta</Text>
        <View style={styles.card}>
          <InfoRow
            icon="help-circle-outline"
            label="Centro de ayuda"
            value=""
            onPress={() => {}}
          />
          <View style={styles.cardDivider} />
          <InfoRow
            icon="document-text-outline"
            label="Términos y condiciones"
            value=""
            onPress={() => {}}
          />
        </View>

        {/* ── Cerrar sesión ─────────────────────────────── */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={signOut}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.signOutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
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

  // ── Perfil header ────────────────────────────────────────
  profileHeader: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  avatar: {
    width: theme.sizes.avatarXl,
    height: theme.sizes.avatarXl,
    borderRadius: theme.radius.circle,
    marginBottom: theme.spacing.md,
  },
  avatarFallback: {
    width: theme.sizes.avatarXl,
    height: theme.sizes.avatarXl,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarInitial: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.badgeRecyclerBg,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  roleBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.badgeRecyclerText,
    letterSpacing: 0.5,
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
  associationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  associationText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.primary,
  },

  // ── Impacto ──────────────────────────────────────────────
  impactCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  impactTitle: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.lg,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactItem: { flex: 1, alignItems: 'center' },
  impactDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  impactValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
  },
  impactUnit: {
    fontSize: theme.typography.sizes.tiny,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 2,
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

  // ── InfoRow ──────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  infoText: { flex: 1 },
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

  // ── Cerrar sesión ────────────────────────────────────────
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing.lg,
    marginTop: theme.spacing.xs,
  },
  signOutText: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
  },
});
