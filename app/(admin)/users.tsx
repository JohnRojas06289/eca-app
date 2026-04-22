import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { formatDateTime } from '@/src/utils/date';
import {
  useUsers,
  type AppUser,
  type UserRole,
  type UserStatus,
  type CreateUserInput,
} from '@/src/context/UsersContext';

type FilterRole = 'all' | UserRole;

const ROLE_FILTERS: { key: FilterRole; label: string }[] = [
  { key: 'all',      label: 'Todos'         },
  { key: 'recycler', label: 'Reutilizadores' },
  { key: 'citizen',  label: 'Ciudadanos'    },
  { key: 'admin',    label: 'Admins'        },
];

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bgColor: string }> = {
  recycler: { label: 'Reutilizador', color: theme.colors.badgeRecyclerText, bgColor: theme.colors.badgeRecyclerBg },
  citizen:  { label: 'Ciudadano',    color: theme.colors.info,              bgColor: theme.colors.infoLight       },
  admin:    { label: 'Admin',        color: theme.colors.badgeAdminText,    bgColor: theme.colors.badgeAdminBg    },
};

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; dotColor: string }> = {
  active:   { label: 'Activo',    color: theme.colors.success, dotColor: theme.colors.success },
  inactive: { label: 'Inactivo',  color: theme.colors.error,   dotColor: theme.colors.error   },
  pending:  { label: 'Pendiente', color: theme.colors.warning, dotColor: theme.colors.warning  },
};

const STATUS_OPTIONS: UserStatus[] = ['active', 'pending', 'inactive'];
const ROLE_OPTIONS: UserRole[]    = ['recycler', 'citizen', 'admin'];

const EMPTY_FORM: CreateUserInput = {
  name: '', cedula: '', role: 'recycler', status: 'pending', association: '',
};

export default function AdminUsersScreen() {
  const router = useRouter();
  const { users, createUser, deleteUser } = useUsers();

  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');
  const [search, setSearch]         = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm]             = useState<CreateUserInput>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const now = new Date();

  const filtered = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch =
      search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.cedula.includes(search);
    return matchesRole && matchesSearch;
  });

  const counts = useMemo(
    () => ({
      total:   users.length,
      active:  users.filter((u) => u.status === 'active').length,
      pending: users.filter((u) => u.status === 'pending').length,
    }),
    [users],
  );

  function openCreate() {
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  async function handleSave() {
    const name = form.name.trim();
    const cedula = form.cedula.trim();

    if (!name || !cedula) {
      Alert.alert('Campos requeridos', 'Nombre y cédula son obligatorios.');
      return;
    }

    if (users.some((u) => u.cedula === cedula)) {
      Alert.alert('Cédula duplicada', 'Ya existe un usuario registrado con esa cédula.');
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 300));
    createUser({
      ...form,
      name,
      cedula,
      association: form.role === 'recycler' ? form.association?.trim() : undefined,
    });
    setSaving(false);
    setModalVisible(false);
  }

  function confirmDelete(u: AppUser) {
    Alert.alert(
      'Eliminar usuario',
      `¿Eliminar a ${u.name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteUser(u.id) },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerKicker}>Administración</Text>
          <Text style={styles.headerTitle}>Usuarios</Text>
          <Text style={styles.headerSubtitle}>Corte: {formatDateTime(now)}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{counts.total}</Text>
          <Text style={styles.metricLabel}>Registrados</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: theme.colors.success }]}>{counts.active}</Text>
          <Text style={styles.metricLabel}>Activos</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={[styles.metricValue, { color: theme.colors.warning }]}>{counts.pending}</Text>
          <Text style={styles.metricLabel}>Pendientes</Text>
        </View>
      </View>

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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
        {ROLE_FILTERS.map((f) => {
          const isActive = roleFilter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setRoleFilter(f.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptySubtitle}>Ajusta el filtro o el término de búsqueda.</Text>
          </View>
        ) : (
          filtered.map((u) => {
            const roleCfg   = ROLE_CONFIG[u.role];
            const statusCfg = STATUS_CONFIG[u.status];
            const initials  = u.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
            return (
              <TouchableOpacity
                key={u.id}
                style={styles.userCard}
                onPress={() =>
                  router.push({
                    pathname: '/(admin)/user-detail' as any,
                    params: {
                      userId:          u.id,
                      userName:        u.name,
                      userCedula:      u.cedula,
                      userRole:        u.role,
                      userStatus:      u.status,
                      userAssociation: u.association ?? '',
                      userJoinedAt:    u.joinedAt,
                      userTotalKg:     u.totalKg?.toString() ?? '0',
                    },
                  })
                }
                activeOpacity={0.85}
              >
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{initials}</Text>
                  <View style={[styles.statusDot, { backgroundColor: statusCfg.dotColor }]} />
                </View>

                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: roleCfg.bgColor }]}>
                      <Text style={[styles.roleBadgeText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
                    </View>
                  </View>
                  <Text style={styles.userCedula}>CC {u.cedula}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>Estado:</Text>
                    <Text style={[styles.metaTextStrong, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                  </View>
                  <Text style={styles.metaHint}>
                    {u.totalKg !== undefined
                      ? `${u.totalKg} kg recolectados · Desde ${u.joinedAt}`
                      : `Desde ${u.joinedAt}`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmDelete(u)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── FAB ─────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
        <Ionicons name="person-add-outline" size={22} color={theme.colors.textOnPrimary} />
      </TouchableOpacity>

      {/* ── Modal Crear usuario ──────────────────────────────── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo usuario</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Nombre */}
              <Text style={styles.fieldLabel}>Nombre completo *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ej: María García"
                placeholderTextColor={theme.colors.textMuted}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />

              {/* Cédula */}
              <Text style={styles.fieldLabel}>Cédula *</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Ej: 12345678"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={form.cedula}
                onChangeText={(v) => setForm((f) => ({ ...f, cedula: v }))}
              />

              {/* Rol */}
              <Text style={styles.fieldLabel}>Rol</Text>
              <View style={styles.segmentRow}>
                {ROLE_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.segmentBtn, form.role === r && styles.segmentBtnActive]}
                    onPress={() => setForm((f) => ({ ...f, role: r }))}
                  >
                    <Text style={[styles.segmentText, form.role === r && styles.segmentTextActive]}>
                      {ROLE_CONFIG[r].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Asociación (solo reutilizadores) */}
              {form.role === 'recycler' && (
                <>
                  <Text style={styles.fieldLabel}>Asociación</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="Ej: Asoc. Zipaquirá"
                    placeholderTextColor={theme.colors.textMuted}
                    value={form.association}
                    onChangeText={(v) => setForm((f) => ({ ...f, association: v }))}
                  />
                </>
              )}

              {/* Estado */}
              <Text style={styles.fieldLabel}>Estado inicial</Text>
              <View style={styles.segmentRow}>
                {STATUS_OPTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.segmentBtn, form.status === s && styles.segmentBtnActive]}
                    onPress={() => setForm((f) => ({ ...f, status: s }))}
                  >
                    <Text style={[styles.segmentText, form.status === s && styles.segmentTextActive]}>
                      {STATUS_CONFIG[s].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Guardar */}
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Crear usuario'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  header: {
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerKicker: {
    fontSize: theme.typography.sizes.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textMuted,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  metricLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.inputHeight,
    marginHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },

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
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  filterLabelActive: { color: theme.colors.textOnPrimary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: 100,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  emptyTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
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
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
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
    paddingVertical: 3,
  },
  roleBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
  },
  userCedula: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  metaTextStrong: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
  metaHint: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: theme.spacing.xs,
    flexShrink: 0,
  },

  // ── FAB ──────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 146,
    right: theme.spacing.screen,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },

  // ── Modal ─────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    padding: theme.spacing.screen,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  fieldLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  fieldInput: {
    height: theme.sizes.inputHeight,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segmentText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  segmentTextActive: {
    color: theme.colors.textOnPrimary,
  },
  saveBtn: {
    height: theme.sizes.buttonHeight,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
});
