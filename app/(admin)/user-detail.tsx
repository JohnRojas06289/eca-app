import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { MaterialItem } from '@/src/components/MaterialItem';
import type { MaterialType } from '@/src/components/MaterialItem';
import { formatRelativeTime } from '@/src/utils/date';
import { useAuth } from '@/src/hooks/useAuth';
import { useUsers, type UserRole, type UserStatus } from '@/src/context/UsersContext';

const RECENT_WEIGHINGS: {
  id: string; material: string; materialType: MaterialType; kg: number; date: Date;
}[] = [
  { id: '1', material: 'Plástico PET',        materialType: 'plastic',   kg: 12.5, date: new Date(Date.now() - 95 * 60 * 1000)       },
  { id: '2', material: 'Cartón Corrugado',    materialType: 'cardboard', kg: 45.0, date: new Date(Date.now() - 20 * 60 * 60 * 1000)   },
  { id: '3', material: 'Vidrio Transparente', materialType: 'glass',     kg: 8.2,  date: new Date(Date.now() - 25 * 60 * 60 * 1000)   },
];

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bgColor: string }> = {
  active:   { label: 'Activo',    color: theme.colors.success, bgColor: theme.colors.successLight },
  inactive: { label: 'Inactivo',  color: theme.colors.error,   bgColor: theme.colors.errorLight   },
  pending:  { label: 'Pendiente', color: theme.colors.warning, bgColor: theme.colors.warningLight  },
};

const ROLE_LABELS: Record<string, string> = {
  recycler: 'Reutilizador',
  admin:    'Administrador',
  citizen:  'Ciudadano',
  supervisor: 'Supervisor',
  superadmin: 'Superadmin',
};

export default function UserDetailScreen() {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const { getUserById, loadUserById, updateUser, deleteUser } = useUsers();
  const params = useLocalSearchParams<{
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    userCedula: string;
    userRole: string;
    userStatus: string;
    userAssociation: string;
    userJoinedAt: string;
    userTotalKg: string;
  }>();

  const userId     = params.userId      ?? '';
  const user = getUserById(userId);
  const initName   = user?.name ?? params.userName ?? '';
  const initEmail  = user?.email ?? params.userEmail ?? '';
  const initPhone  = user?.phone ?? params.userPhone ?? '';
  const initCedula = user?.cedula ?? params.userCedula ?? '';
  const initRole   = (user?.role ?? params.userRole ?? 'citizen') as UserRole;
  const initStatus = (user?.status ?? params.userStatus ?? 'active') as UserStatus;
  const initAssoc  = user?.association ?? params.userAssociation ?? '';
  const joinedAt   = user?.joinedAt ?? params.userJoinedAt ?? '—';
  const totalKg    = user?.totalKg ?? Number(params.userTotalKg ?? 0);

  const [role, setRole]           = useState<UserRole>(initRole);
  const [status, setStatus]       = useState<UserStatus>(initStatus);
  const [name, setName]           = useState(initName);
  const [email, setEmail]         = useState(initEmail);
  const [phone, setPhone]         = useState(initPhone);
  const [cedula, setCedula]       = useState(initCedula);
  const [association, setAssoc]   = useState(initAssoc);
  const [toggling, setToggling]   = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editName, setEditName]   = useState(initName);
  const [editEmail, setEditEmail] = useState(initEmail);
  const [editPhone, setEditPhone] = useState(initPhone);
  const [editCedula, setEditCedula] = useState(initCedula);
  const [editRole, setEditRole]   = useState<UserRole>(initRole);
  const [editAssoc, setEditAssoc] = useState(initAssoc);
  const [editPassword, setEditPassword] = useState('');

  const ROLE_EDIT_OPTIONS: UserRole[] = authUser?.role === 'superadmin'
    ? ['recycler', 'citizen', 'admin', 'supervisor', 'superadmin']
    : ['recycler', 'citizen', 'admin', 'supervisor'];

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone ?? '');
    setCedula(user.cedula);
    setRole(user.role);
    setStatus(user.status);
    setAssoc(user.association ?? '');
  }, [user]);

  useEffect(() => {
    if (!userId || user) return;
    setLoadingUser(true);
    setLoadError(null);
    loadUserById(userId)
      .catch((error: any) => {
        setLoadError(error?.message ?? 'No se pudo cargar el usuario.');
      })
      .finally(() => setLoadingUser(false));
  }, [user, userId, loadUserById]);

  const statusCfg = STATUS_CONFIG[status];
  const initials  = name.split(' ').map((n: string) => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  async function toggleStatus() {
    if (!userId) return;
    setToggling(true);
    try {
      const next: UserStatus = status === 'active' ? 'inactive' : 'active';
      await updateUser(userId, { status: next });
      setStatus(next);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo actualizar el estado del usuario.');
    } finally {
      setToggling(false);
    }
  }

  function confirmApprove() {
    if (!userId) return;
    Alert.alert(
      'Aprobar usuario',
      `¿Aprobar a ${name} como reutilizador activo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar', style: 'default', onPress: async () => {
            try {
              await updateUser(userId, { status: 'active' });
              setStatus('active');
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'No se pudo aprobar el usuario.');
            }
          },
        },
      ],
    );
  }

  function openEdit() {
    setEditName(name);
    setEditEmail(email);
    setEditPhone(phone);
    setEditCedula(cedula);
    setEditRole(role);
    setEditAssoc(association);
    setEditPassword('');
    setEditVisible(true);
  }

  async function saveEdit() {
    if (!userId) return;
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Campos requeridos', 'Nombre y correo son obligatorios.');
      return;
    }
    if (!editEmail.includes('@')) {
      Alert.alert('Correo inválido', 'Ingresa un correo válido.');
      return;
    }
    if (editPassword.trim() && editPassword.trim().length < 8) {
      Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    const nextRole = editRole;
    const nextAssoc = nextRole === 'recycler' ? editAssoc.trim() : '';
    setSavingEdit(true);
    try {
      await updateUser(userId, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || null,
        cedula: editCedula.trim() || null,
        role: nextRole,
        association: nextRole === 'recycler' ? nextAssoc || null : null,
        password: editPassword.trim() || undefined,
      });

      setName(editName.trim());
      setEmail(editEmail.trim());
      setPhone(editPhone.trim());
      setCedula(editCedula.trim());
      setRole(nextRole);
      setAssoc(nextAssoc);
      setEditVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'No se pudo guardar el usuario.');
    } finally {
      setSavingEdit(false);
    }
  }

  function confirmDelete() {
    if (!userId) return;
    if (authUser?.id === userId) {
      Alert.alert('Acción no permitida', 'No puedes eliminar tu propio usuario.');
      return;
    }
    Alert.alert(
      'Eliminar usuario',
      `¿Eliminar a ${name}? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive', onPress: async () => {
            try {
              await deleteUser(userId);
              router.back();
            } catch (error: any) {
              Alert.alert('Error', error?.message ?? 'No se pudo eliminar el usuario.');
            }
          },
        },
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
        <TouchableOpacity
          onPress={openEdit}
          disabled={loadingUser}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="create-outline" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {!!loadError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorBannerText}>{loadError}</Text>
        </View>
      )}

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
          <Text style={styles.profileName}>{name || 'Usuario'}</Text>
          <Text style={styles.profileCedula}>CC {cedula || '—'}</Text>
          <Text style={styles.profileEmail}>{email || '—'}</Text>
          {association !== '' && (
            <View style={styles.assocBadge}>
              <Ionicons name="leaf-outline" size={12} color={theme.colors.primary} />
              <Text style={styles.assocText}>{association}</Text>
            </View>
          )}
        </View>

        {/* ── Métricas ──────────────────────────────────────── */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalKg.toLocaleString('es-CO')}</Text>
            <Text style={styles.metricLabel}>kg recolectados</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>—</Text>
            <Text style={styles.metricLabel}>rutas completadas</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>—</Text>
            <Text style={styles.metricLabel}>valor generado</Text>
          </View>
        </View>

        {/* ── Información ───────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Registrado</Text>
            <Text style={styles.infoValue}>{joinedAt}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Correo</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{phone || '—'}</Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={16} color={theme.colors.textMuted} />
            <Text style={styles.infoLabel}>Rol</Text>
            <Text style={styles.infoValue}>
              {ROLE_LABELS[role] ?? role}
            </Text>
          </View>
        </View>

        {/* ── Pesajes recientes (solo reutilizadores) ────────── */}
        {role === 'recycler' && (
          <>
            <Text style={styles.sectionTitle}>Pesajes Recientes</Text>
            {totalKg > 0 ? RECENT_WEIGHINGS.map((w) => (
              <MaterialItem
                key={w.id}
                name={w.material}
                timestamp={formatRelativeTime(w.date)}
                value={`${w.kg} kg`}
                valueColor={theme.colors.primary}
                materialType={w.materialType}
              />
            )) : (
              <View style={styles.emptyWeighings}>
                <Ionicons name="scale-outline" size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyWeighingsText}>Sin pesajes registrados</Text>
              </View>
            )}
          </>
        )}

        {/* ── Acciones ──────────────────────────────────────── */}
        <View style={styles.actionsSection}>
          {status === 'pending' ? (
            <CustomButton
              label="Aprobar Usuario"
              leftIcon={<Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.textOnPrimary} />}
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

          <TouchableOpacity style={styles.deleteUserBtn} onPress={confirmDelete} activeOpacity={0.85}>
            <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
            <Text style={styles.deleteUserText}>Eliminar usuario</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Modal Editar ─────────────────────────────────────── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar usuario</Text>
              <TouchableOpacity onPress={() => setEditVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Nombre completo</Text>
              <TextInput
                style={styles.fieldInput}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Correo</Text>
              <TextInput
                style={styles.fieldInput}
                value={editEmail}
                onChangeText={setEditEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Teléfono</Text>
              <TextInput
                style={styles.fieldInput}
                value={editPhone}
                onChangeText={setEditPhone}
                keyboardType="phone-pad"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Cédula</Text>
              <TextInput
                style={styles.fieldInput}
                value={editCedula}
                onChangeText={setEditCedula}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Rol</Text>
              <View style={styles.segmentRow}>
                {ROLE_EDIT_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.segmentBtn, editRole === r && styles.segmentBtnActive]}
                    onPress={() => setEditRole(r)}
                  >
                    <Text style={[styles.segmentText, editRole === r && styles.segmentTextActive]}>
                      {ROLE_LABELS[r]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {editRole === 'recycler' && (
                <>
                  <Text style={styles.fieldLabel}>Asociación</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={editAssoc}
                    onChangeText={setEditAssoc}
                    placeholder="Ej: Asoc. Zipaquirá"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </>
              )}

              <Text style={styles.fieldLabel}>Nueva contraseña (opcional)</Text>
              <TextInput
                style={styles.fieldInput}
                value={editPassword}
                onChangeText={setEditPassword}
                secureTextEntry
                placeholder="Solo si deseas cambiarla"
                placeholderTextColor={theme.colors.textMuted}
              />

              <TouchableOpacity
                style={[styles.saveBtn, savingEdit && styles.saveBtnDisabled]}
                onPress={saveEdit}
                activeOpacity={0.85}
                disabled={savingEdit}
              >
                <Text style={styles.saveBtnText}>{savingEdit ? 'Guardando...' : 'Guardar cambios'}</Text>
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: '#fde8e8',
    marginHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
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
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
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

  // ── Empty weighings ──────────────────────────────────────
  emptyWeighings: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  emptyWeighingsText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
  },

  // ── Acciones ─────────────────────────────────────────────
  actionsSection: { marginTop: theme.spacing.xl, gap: theme.spacing.md },
  actionBtn: {},
  deleteUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    height: theme.sizes.buttonHeight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  deleteUserText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
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
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
});
