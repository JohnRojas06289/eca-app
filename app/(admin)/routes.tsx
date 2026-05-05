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
import { formatLongDate } from '@/src/utils/date';
import { useOperationalReports } from '@/src/context/OperationalReportsContext';
import type { OperationalWeekday } from '@/src/constants/operationalReport';

const ALL_WEEKDAYS: OperationalWeekday[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type RouteStatus = 'active' | 'paused' | 'completed' | 'pending';

interface RouteItem {
  id: string;
  name: string;
  zone: string;
  recyclerName: string;
  stops: number;
  stopsCompleted: number;
  status: RouteStatus;
  startTime: string;
  estimatedEnd: string;
}

interface RouteForm {
  name: string;
  zone: string;
  recyclerName: string;
  stops: string;
  stopsCompleted: string;
  status: RouteStatus;
  startTime: string;
  estimatedEnd: string;
}

const INITIAL_ROUTES: RouteItem[] = [
  { id: '1', name: 'Centro Histórico', zone: 'Centro', recyclerName: 'Juan Pérez', stops: 20, stopsCompleted: 13, status: 'active', startTime: '6:30 AM', estimatedEnd: '12:00 PM' },
  { id: '2', name: 'San Pablo Norte', zone: 'San Pablo', recyclerName: 'Carlos Romero', stops: 15, stopsCompleted: 15, status: 'completed', startTime: '7:00 AM', estimatedEnd: '11:30 AM' },
  { id: '3', name: 'El Jardín', zone: 'El Jardín', recyclerName: 'Sofía Vargas', stops: 18, stopsCompleted: 0, status: 'pending', startTime: '8:00 AM', estimatedEnd: '2:00 PM' },
  { id: '4', name: 'La Granja Sur', zone: 'La Granja', recyclerName: 'Luis García', stops: 12, stopsCompleted: 5, status: 'paused', startTime: '7:30 AM', estimatedEnd: '1:00 PM' },
  { id: '5', name: 'Algarra III', zone: 'Algarra', recyclerName: 'María González', stops: 14, stopsCompleted: 0, status: 'pending', startTime: '9:00 AM', estimatedEnd: '3:00 PM' },
];

const STATUS_CONFIG: Record<RouteStatus, { label: string; color: string; bgColor: string; dot: string }> = {
  active: { label: 'En curso', color: theme.colors.success, bgColor: theme.colors.successLight, dot: theme.colors.success },
  paused: { label: 'Pausada', color: theme.colors.warning, bgColor: theme.colors.warningLight, dot: theme.colors.warning },
  completed: { label: 'Completada', color: theme.colors.textMuted, bgColor: theme.colors.separator, dot: theme.colors.textMuted },
  pending: { label: 'Pendiente', color: theme.colors.info, bgColor: theme.colors.infoLight, dot: theme.colors.info },
};

const STATUS_OPTIONS: RouteStatus[] = ['pending', 'active', 'paused', 'completed'];

const EMPTY_FORM: RouteForm = {
  name: '',
  zone: '',
  recyclerName: '',
  stops: '',
  stopsCompleted: '0',
  status: 'pending',
  startTime: '',
  estimatedEnd: '',
};

export default function AdminRoutesScreen() {
  const router = useRouter();
  const { routeConfigs, setRouteConfigs } = useOperationalReports();
  const [activeTab, setActiveTab] = useState<'general' | 'operational'>('general');
  const [search, setSearch] = useState('');
  const [routes, setRoutes] = useState<RouteItem[]>(INITIAL_ROUTES);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RouteForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Operational micro routes state
  const [opModalVisible, setOpModalVisible] = useState(false);
  const [opEditingKey, setOpEditingKey] = useState<string | null>(null);
  const [opForm, setOpForm] = useState({ macroRoute: '', microRoute: '', frequencyDays: [] as OperationalWeekday[] });

  function openOpCreate() {
    setOpEditingKey(null);
    setOpForm({ macroRoute: '', microRoute: '', frequencyDays: [] });
    setOpModalVisible(true);
  }

  function openOpEdit(route: typeof routeConfigs[0]) {
    setOpEditingKey(route.microRoute);
    setOpForm({ macroRoute: route.macroRoute, microRoute: route.microRoute, frequencyDays: [...route.frequencyDays] });
    setOpModalVisible(true);
  }

  function toggleOpDay(day: OperationalWeekday) {
    setOpForm((prev) => ({
      ...prev,
      frequencyDays: prev.frequencyDays.includes(day)
        ? prev.frequencyDays.filter((d) => d !== day)
        : [...prev.frequencyDays, day],
    }));
  }

  function handleOpSave() {
    const macroRoute = opForm.macroRoute.trim();
    const microRoute = opForm.microRoute.trim();
    if (!macroRoute || !microRoute) {
      Alert.alert('Campos requeridos', 'Ingresa macroruta y microruta.');
      return;
    }
    if (
      !opEditingKey &&
      routeConfigs.some((r) => r.microRoute === microRoute)
    ) {
      Alert.alert('Duplicada', `La microruta "${microRoute}" ya existe.`);
      return;
    }
    if (opEditingKey) {
      setRouteConfigs((prev) =>
        prev.map((r) =>
          r.microRoute === opEditingKey
            ? { macroRoute, microRoute, frequencyDays: opForm.frequencyDays, onlyAssociatedToEca: true }
            : r,
        ),
      );
    } else {
      setRouteConfigs((prev) => [
        ...prev,
        { macroRoute, microRoute, frequencyDays: opForm.frequencyDays, onlyAssociatedToEca: true },
      ]);
    }
    setOpModalVisible(false);
  }

  function confirmOpDelete(microRoute: string) {
    Alert.alert('Eliminar microruta', `¿Eliminar la microruta "${microRoute}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setRouteConfigs((prev) => prev.filter((r) => r.microRoute !== microRoute)) },
    ]);
  }

  const filtered = routes.filter(
    (r) =>
      search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.recyclerName.toLowerCase().includes(search.toLowerCase()) ||
      r.zone.toLowerCase().includes(search.toLowerCase()),
  );

  const metrics = useMemo(() => {
    const activeCount = routes.filter((r) => r.status === 'active').length;
    const completedCount = routes.filter((r) => r.status === 'completed').length;
    const pausedCount = routes.filter((r) => r.status === 'paused').length;
    const totalStops = routes.reduce((acc, route) => acc + route.stops, 0);
    const totalStopsCompleted = routes.reduce((acc, route) => acc + route.stopsCompleted, 0);
    const coveragePct = totalStops > 0 ? Math.round((totalStopsCompleted / totalStops) * 100) : 0;

    return { activeCount, completedCount, pausedCount, totalStops, totalStopsCompleted, coveragePct };
  }, [routes]);

  const hour = new Date().getHours();
  const shift = hour < 12 ? 'Turno mañana' : hour < 18 ? 'Turno tarde' : 'Turno noche';

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(route: RouteItem) {
    setEditingId(route.id);
    setForm({
      name: route.name,
      zone: route.zone,
      recyclerName: route.recyclerName,
      stops: String(route.stops),
      stopsCompleted: String(route.stopsCompleted),
      status: route.status,
      startTime: route.startTime,
      estimatedEnd: route.estimatedEnd,
    });
    setModalVisible(true);
  }

  async function handleSave() {
    const name = form.name.trim();
    const zone = form.zone.trim();
    const recyclerName = form.recyclerName.trim();
    const startTime = form.startTime.trim();
    const estimatedEnd = form.estimatedEnd.trim();
    const stops = Number(form.stops);
    const stopsCompleted = Number(form.stopsCompleted || '0');

    if (!name || !zone || !recyclerName || !startTime || !estimatedEnd) {
      Alert.alert('Campos requeridos', 'Completa nombre, zona, reciclador y horarios.');
      return;
    }

    if (!Number.isFinite(stops) || stops <= 0) {
      Alert.alert('Paradas inválidas', 'Ingresa un número de paradas mayor a 0.');
      return;
    }

    if (!Number.isFinite(stopsCompleted) || stopsCompleted < 0) {
      Alert.alert('Progreso inválido', 'Paradas completadas no puede ser negativo.');
      return;
    }

    const fixedCompleted = Math.min(stopsCompleted, stops);

    setSaving(true);
    await new Promise((r) => setTimeout(r, 250));

    if (editingId) {
      setRoutes((prev) =>
        prev.map((route) =>
          route.id === editingId
            ? { ...route, name, zone, recyclerName, startTime, estimatedEnd, stops, stopsCompleted: fixedCompleted, status: form.status }
            : route,
        ),
      );
    } else {
      const newRoute: RouteItem = {
        id: Date.now().toString(),
        name,
        zone,
        recyclerName,
        startTime,
        estimatedEnd,
        stops,
        stopsCompleted: fixedCompleted,
        status: form.status,
      };
      setRoutes((prev) => [newRoute, ...prev]);
    }

    setSaving(false);
    setModalVisible(false);
  }

  function confirmDelete(route: RouteItem) {
    Alert.alert(
      'Eliminar ruta',
      `¿Eliminar la ruta "${route.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => setRoutes((prev) => prev.filter((r) => r.id !== route.id)) },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Rutas</Text>
          <Text style={styles.headerSubtitle}>{formatLongDate()} · {shift}</Text>
        </View>
        <TouchableOpacity
          onPress={activeTab === 'general' ? openCreate : openOpCreate}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'general' && styles.tabBtnActive]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'general' && styles.tabBtnTextActive]}>
            Rutas generales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'operational' && styles.tabBtnActive]}
          onPress={() => setActiveTab('operational')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'operational' && styles.tabBtnTextActive]}>
            Microrutas operativas
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'general' && (
        <>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: theme.colors.success }]}>{metrics.activeCount}</Text>
              <Text style={styles.summaryLabel}>En curso</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: theme.colors.warning }]}>{metrics.pausedCount}</Text>
              <Text style={styles.summaryLabel}>Pausadas</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: theme.colors.textPrimary }]}>{metrics.completedCount}</Text>
              <Text style={styles.summaryLabel}>Completadas</Text>
            </View>
          </View>

          <View style={styles.coverageCard}>
            <View style={styles.coverageHeader}>
              <Text style={styles.coverageTitle}>Cobertura del día</Text>
              <Text style={styles.coveragePercent}>{metrics.coveragePct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${metrics.coveragePct}%` }]} />
            </View>
            <Text style={styles.coverageMeta}>{metrics.totalStopsCompleted} de {metrics.totalStops} paradas completadas</Text>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar ruta, zona o reciclador..."
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
        </>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' ? (
          filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin rutas</Text>
              <Text style={styles.emptySubtitle}>Crea una ruta o ajusta la búsqueda.</Text>
            </View>
          ) : (
            filtered.map((route) => {
              const cfg = STATUS_CONFIG[route.status];
              const progress = route.stops > 0 ? Math.round((route.stopsCompleted / route.stops) * 100) : 0;

              return (
                <View key={route.id} style={styles.routeCard}>
                  <View style={styles.routeCardHeader}>
                    <View style={styles.routeHeaderInfo}>
                      <Text style={styles.routeName}>{route.name}</Text>
                      <Text style={styles.routeZone}>{route.zone}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bgColor }]}>
                      <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
                      <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.metaText}>{route.recyclerName}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.metaText}>{route.startTime} → {route.estimatedEnd}</Text>
                  </View>

                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Paradas {route.stopsCompleted}/{route.stops}</Text>
                    <Text style={styles.progressPercent}>{progress}%</Text>
                  </View>
                  <View style={styles.routeProgressTrack}>
                    <View
                      style={[
                        styles.routeProgressFill,
                        { width: `${progress}%` },
                        route.status === 'paused' && { backgroundColor: theme.colors.warning },
                        route.status === 'completed' && { backgroundColor: theme.colors.textMuted },
                      ]}
                    />
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(route)}>
                      <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                      <Text style={[styles.actionText, { color: theme.colors.primary }]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => confirmDelete(route)}>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                      <Text style={[styles.actionText, { color: theme.colors.error }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )
        ) : (
          routeConfigs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="navigate-outline" size={32} color={theme.colors.textMuted} />
              <Text style={styles.emptyTitle}>Sin microrutas</Text>
              <Text style={styles.emptySubtitle}>Agrega microrutas operativas con el botón +</Text>
            </View>
          ) : (
            routeConfigs.map((rc) => (
              <View key={rc.microRoute} style={styles.opCard}>
                <View style={styles.opCardHeader}>
                  <View style={styles.opCardInfo}>
                    <Text style={styles.opMacroLabel}>Macroruta</Text>
                    <Text style={styles.opMacroValue}>{rc.macroRoute}</Text>
                    <Text style={styles.opMicroLabel}>Microruta</Text>
                    <Text style={styles.opMicroValue}>{rc.microRoute}</Text>
                  </View>
                  <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => openOpEdit(rc)}>
                      <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                      <Text style={[styles.actionText, { color: theme.colors.primary }]}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => confirmOpDelete(rc.microRoute)}>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                      <Text style={[styles.actionText, { color: theme.colors.error }]}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.opFreqLabel}>Frecuencia</Text>
                <View style={styles.opDaysRow}>
                  {ALL_WEEKDAYS.map((day) => (
                    <View
                      key={day}
                      style={[styles.opDayChip, rc.frequencyDays.includes(day) && styles.opDayChipActive]}
                    >
                      <Text style={[styles.opDayText, rc.frequencyDays.includes(day) && styles.opDayTextActive]}>
                        {day.slice(0, 2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={activeTab === 'general' ? openCreate : openOpCreate}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color={theme.colors.textOnPrimary} />
      </TouchableOpacity>

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
              <Text style={styles.modalTitle}>{editingId ? 'Editar ruta' : 'Nueva ruta'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Nombre de la ruta *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="Ej: Centro Histórico"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Zona *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.zone}
                onChangeText={(v) => setForm((f) => ({ ...f, zone: v }))}
                placeholder="Ej: Centro"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Reciclador asignado *</Text>
              <TextInput
                style={styles.fieldInput}
                value={form.recyclerName}
                onChangeText={(v) => setForm((f) => ({ ...f, recyclerName: v }))}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor={theme.colors.textMuted}
              />

              <View style={styles.twoCols}>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Paradas *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form.stops}
                    onChangeText={(v) => setForm((f) => ({ ...f, stops: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Completadas</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form.stopsCompleted}
                    onChangeText={(v) => setForm((f) => ({ ...f, stopsCompleted: v }))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Estado</Text>
              <View style={styles.segmentRow}>
                {STATUS_OPTIONS.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[styles.segmentBtn, form.status === status && styles.segmentBtnActive]}
                    onPress={() => setForm((f) => ({ ...f, status }))}
                  >
                    <Text style={[styles.segmentText, form.status === status && styles.segmentTextActive]}>
                      {STATUS_CONFIG[status].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.twoCols}>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Hora inicio *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form.startTime}
                    onChangeText={(v) => setForm((f) => ({ ...f, startTime: v }))}
                    placeholder="Ej: 7:00 AM"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.fieldLabel}>Hora fin estimada *</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={form.estimatedEnd}
                    onChangeText={(v) => setForm((f) => ({ ...f, estimatedEnd: v }))}
                    placeholder="Ej: 1:00 PM"
                    placeholderTextColor={theme.colors.textMuted}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear ruta'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Operational micro route modal */}
      <Modal
        visible={opModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setOpModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{opEditingKey ? 'Editar microruta' : 'Nueva microruta'}</Text>
              <TouchableOpacity onPress={() => setOpModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Macroruta *</Text>
              <TextInput
                style={styles.fieldInput}
                value={opForm.macroRoute}
                onChangeText={(v) => setOpForm((f) => ({ ...f, macroRoute: v }))}
                placeholder="Ej: Zona Norte"
                placeholderTextColor={theme.colors.textMuted}
              />

              <Text style={styles.fieldLabel}>Microruta *</Text>
              <TextInput
                style={styles.fieldInput}
                value={opForm.microRoute}
                onChangeText={(v) => setOpForm((f) => ({ ...f, microRoute: v }))}
                placeholder="Ej: MR-01"
                placeholderTextColor={theme.colors.textMuted}
                editable={!opEditingKey}
              />

              <Text style={styles.fieldLabel}>Frecuencia (días de recolección)</Text>
              <View style={styles.opDaysRow}>
                {ALL_WEEKDAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.opDayChip, opForm.frequencyDays.includes(day) && styles.opDayChipActive]}
                    onPress={() => toggleOpDay(day)}
                  >
                    <Text style={[styles.opDayText, opForm.frequencyDays.includes(day) && styles.opDayTextActive]}>
                      {day.slice(0, 2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleOpSave}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>
                  {opEditingKey ? 'Guardar cambios' : 'Crear microruta'}
                </Text>
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
  headerCenter: { alignItems: 'center' },
  headerTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  coverageCard: {
    marginHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  coverageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  coverageTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  coveragePercent: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  progressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.separator,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
  },
  coverageMeta: {
    marginTop: theme.spacing.xs,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
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

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: 180,
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

  routeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  routeHeaderInfo: { flex: 1 },
  routeName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  routeZone: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: 4,
  },
  metaText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  progressPercent: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  routeProgressTrack: {
    height: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.separator,
    overflow: 'hidden',
  },
  routeProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.pill,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },

  fab: {
    position: 'absolute',
    bottom: 146,
    right: theme.spacing.screen,
    width: 56,
    height: 56,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },

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
  twoCols: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  col: { flex: 1 },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  segmentBtn: {
    minWidth: '48%',
    height: 38,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
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
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },

  // Tab row
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.separator,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    height: 34,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: theme.colors.background,
    ...theme.shadows.sm,
  },
  tabBtnText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
  },
  tabBtnTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },

  // Operational route cards
  opCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  opCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  opCardInfo: { flex: 1 },
  opMacroLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  opMacroValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  opMicroLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  opMicroValue: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  opFreqLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  opDaysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  opDayChip: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opDayChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  opDayText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
  },
  opDayTextActive: {
    color: theme.colors.textOnPrimary,
  },
});
