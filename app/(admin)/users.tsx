import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

type UserRole   = 'recycler' | 'citizen' | 'admin';
type UserStatus = 'active' | 'inactive' | 'pending';
type FilterRole = 'all' | UserRole;

interface AppUser {
  id: string;
  name: string;
  cedula: string;
  role: UserRole;
  status: UserStatus;
  association?: string;
  joinedAt: string;
  totalKg?: number;
}

const USERS: AppUser[] = [
  { id: '1', name: 'Juan Pérez',         cedula: '12345678', role: 'recycler', status: 'active',   association: 'Asoc. Zipaquirá', joinedAt: 'Ene 2024', totalKg: 1250 },
  { id: '2', name: 'María González',     cedula: '87654321', role: 'recycler', status: 'pending',  association: 'Asoc. Zipaquirá', joinedAt: 'Mar 2026'                },
  { id: '3', name: 'Carlos Ruiz',        cedula: '23456789', role: 'citizen',  status: 'active',   joinedAt: 'Feb 2025'                                               },
  { id: '4', name: 'Ana Martínez',       cedula: '34567890', role: 'citizen',  status: 'active',   joinedAt: 'Jun 2025'                                               },
  { id: '5', name: 'Pedro Sánchez',      cedula: '45678901', role: 'recycler', status: 'inactive', association: 'Asoc. Norte',     joinedAt: 'Oct 2023', totalKg: 320  },
  { id: '6', name: 'Lucía Fernández',    cedula: '56789012', role: 'admin',    status: 'active',   joinedAt: 'Ene 2023'                                               },
  { id: '7', name: 'Diego Torres',       cedula: '67890123', role: 'citizen',  status: 'active',   joinedAt: 'Nov 2025'                                               },
];

const ROLE_FILTERS: { key: FilterRole; label: string }[] = [
  { key: 'all',      label: 'Todos'       },
  { key: 'recycler', label: 'Recicladores'},
  { key: 'citizen',  label: 'Ciudadanos'  },
  { key: 'admin',    label: 'Admins'      },
];

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  recycler: { label: 'Reciclador', color: theme.colors.badgeRecyclerText, bgColor: theme.colors.badgeRecyclerBg },
  citizen:  { label: 'Ciudadano',  color: theme.colors.info,              bgColor: theme.colors.infoLight        },
  admin:    { label: 'Admin',      color: theme.colors.badgeAdminText,    bgColor: theme.colors.badgeAdminBg     },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; dotColor: string }> = {
  active:   { label: 'Activo',    color: theme.colors.success, dotColor: theme.colors.success },
  inactive: { label: 'Inactivo',  color: theme.colors.error,   dotColor: theme.colors.error   },
  pending:  { label: 'Pendiente', color: theme.colors.warning, dotColor: theme.colors.warning },
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');
  const [search,     setSearch]     = useState('');

  const filtered = USERS.filter((u) => {
    const matchesRole   = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.cedula.includes(search);
    return matchesRole && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <View style={styles.headerCount}>
          <Text style={styles.headerCountText}>{USERS.length}</Text>
        </View>
      </View>

      {/* ── Búsqueda ──────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o cédula..."
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search !== '' && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filtros de rol ────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {ROLE_FILTERS.map((f) => {
          const isActive = roleFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setRoleFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Lista de usuarios ─────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No se encontraron usuarios</Text>
        ) : (
          filtered.map((u) => {
            const roleCfg    = ROLE_CONFIG[u.role];
            const statusCfg  = STATUS_CONFIG[u.status];
            const initials   = u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
            return (
              <TouchableOpacity
                key={u.id}
                style={styles.userCard}
                onPress={() => router.push('/(admin)/user-detail' as any)}
                activeOpacity={0.85}
              >
                {/* Avatar */}
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{initials}</Text>
                  <View style={[styles.statusDot, { backgroundColor: statusCfg.dotColor }]} />
                </View>

                {/* Info */}
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleCfg.bgColor }]}>
                      <Text style={[styles.roleBadgeText, { color: roleCfg.color }]}>
                        {roleCfg.label}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.userCedula}>CC {u.cedula}</Text>
                  <View style={styles.userMeta}>
                    {u.totalKg !== undefined && (
                      <Text style={styles.userMetaItem}>
                        {u.totalKg} kg recolectados
                      </Text>
                    )}
                    <Text style={styles.userMetaItem}>Desde {u.joinedAt}</Text>
                  </View>
                </View>

                <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
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
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerCount: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  headerCountText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
  },

  // ── Búsqueda ─────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },

  // ── Filtros ──────────────────────────────────────────────
  filtersScroll: {
    paddingHorizontal: theme.spacing.screen,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.chipHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  filterLabelActive: { color: theme.colors.textOnPrimary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Tarjeta usuario ──────────────────────────────────────
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  userAvatar: {
    width: theme.sizes.avatarMd,
    height: theme.sizes.avatarMd,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },
  userAvatarText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 2,
  },
  userName: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  roleBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    flexShrink: 0,
  },
  roleBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.3,
  },
  userCedula: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  userMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  userMetaItem: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
  },
  empty: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },
});
