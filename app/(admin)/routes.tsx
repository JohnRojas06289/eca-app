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

const ROUTES: RouteItem[] = [
  { id: '1', name: 'Centro Histórico',  zone: 'Centro',       recyclerName: 'Juan Pérez',      stops: 20, stopsCompleted: 13, status: 'active',    startTime: '6:30 AM',  estimatedEnd: '12:00 PM' },
  { id: '2', name: 'San Pablo Norte',   zone: 'San Pablo',    recyclerName: 'Carlos Romero',   stops: 15, stopsCompleted: 15, status: 'completed', startTime: '7:00 AM',  estimatedEnd: '11:30 AM' },
  { id: '3', name: 'El Jardín',         zone: 'El Jardín',    recyclerName: 'Sofía Vargas',    stops: 18, stopsCompleted: 0,  status: 'pending',   startTime: '8:00 AM',  estimatedEnd: '2:00 PM'  },
  { id: '4', name: 'La Granja Sur',     zone: 'La Granja',    recyclerName: 'Luis García',     stops: 12, stopsCompleted: 5,  status: 'paused',    startTime: '7:30 AM',  estimatedEnd: '1:00 PM'  },
  { id: '5', name: 'Algarra III',       zone: 'Algarra',      recyclerName: 'María González',  stops: 14, stopsCompleted: 0,  status: 'pending',   startTime: '9:00 AM',  estimatedEnd: '3:00 PM'  },
];

const STATUS_CONFIG: Record<RouteStatus, { label: string; color: string; bgColor: string; dot: string }> = {
  active:    { label: 'En curso',   color: theme.colors.success, bgColor: theme.colors.successLight, dot: theme.colors.success },
  paused:    { label: 'Pausada',    color: theme.colors.warning, bgColor: theme.colors.warningLight, dot: theme.colors.warning },
  completed: { label: 'Completada', color: theme.colors.textMuted, bgColor: theme.colors.separator, dot: theme.colors.textMuted },
  pending:   { label: 'Pendiente',  color: theme.colors.info,    bgColor: theme.colors.infoLight,    dot: theme.colors.info    },
};

export default function AdminRoutesScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = ROUTES.filter(
    (r) =>
      search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.recyclerName.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount    = ROUTES.filter((r) => r.status === 'active').length;
  const completedCount = ROUTES.filter((r) => r.status === 'completed').length;

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
        <Text style={styles.headerTitle}>Gestión de Rutas</Text>
        <Ionicons name="map-outline" size={24} color={theme.colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Mini resumen ──────────────────────────────────── */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{activeCount}</Text>
            <Text style={styles.summaryLabel}>En curso</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{completedCount}</Text>
            <Text style={styles.summaryLabel}>Completadas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{ROUTES.length}</Text>
            <Text style={styles.summaryLabel}>Total hoy</Text>
          </View>
        </View>

        {/* ── Mapa placeholder ──────────────────────────────── */}
        <View style={styles.mapContainer}>
          {/* Reemplazar con MapView de react-native-maps */}
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={theme.colors.primaryMid} />
          </View>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={styles.legendText}>En curso ({activeCount})</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.info }]} />
              <Text style={styles.legendText}>Pendientes</Text>
            </View>
          </View>
        </View>

        {/* ── Búsqueda ──────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ruta o reciclador..."
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

        {/* ── Lista de rutas ────────────────────────────────── */}
        {filtered.map((route) => {
          const cfg      = STATUS_CONFIG[route.status];
          const progress = route.stops > 0
            ? Math.round((route.stopsCompleted / route.stops) * 100)
            : 0;

          return (
            <TouchableOpacity
              key={route.id}
              style={styles.routeCard}
              onPress={() => {}}
              activeOpacity={0.85}
            >
              {/* Cabecera */}
              <View style={styles.routeCardHeader}>
                <View>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeZone}>{route.zone}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bgColor }]}>
                  <View style={[styles.statusDot, { backgroundColor: cfg.dot }]} />
                  <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
              </View>

              {/* Reciclador */}
              <View style={styles.recyclerRow}>
                <Ionicons name="person-outline" size={14} color={theme.colors.textMuted} />
                <Text style={styles.recyclerName}>{route.recyclerName}</Text>
              </View>

              {/* Barra de progreso */}
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Paradas: {route.stopsCompleted}/{route.stops}</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                    route.status === 'paused' && { backgroundColor: theme.colors.warning },
                  ]}
                />
              </View>

              {/* Horario */}
              <View style={styles.timeRow}>
                <Ionicons name="time-outline" size={13} color={theme.colors.textMuted} />
                <Text style={styles.timeText}>
                  {route.startTime} → {route.estimatedEnd}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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

  // ── Resumen ──────────────────────────────────────────────
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: 2,
  },

  // ── Mapa ─────────────────────────────────────────────────
  mapContainer: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  mapPlaceholder: {
    height: 140,
    backgroundColor: '#D4EAD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLegend: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  // ── Búsqueda ─────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },

  // ── Tarjeta ruta ─────────────────────────────────────────
  routeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  routeName: {
    fontSize: theme.typography.sizes.h4,
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
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    flexShrink: 0,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.3,
  },
  recyclerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  recyclerName: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  progressLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  progressPercent: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  progressTrack: {
    height: 6,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timeText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
});
