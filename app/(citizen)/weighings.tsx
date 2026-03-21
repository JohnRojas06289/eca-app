import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { MaterialItem } from '@/src/components/MaterialItem';
import type { MaterialType } from '@/src/components/MaterialItem';

type FilterTab = 'Día' | 'Semana' | 'Mes';

interface WeighingRecord {
  id: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  date: string;
  status: 'CONFIRMADO' | 'PENDIENTE' | 'RECHAZADO';
}

const DEMO_WEIGHINGS: WeighingRecord[] = [
  { id: '1', material: 'Plástico PET',       materialType: 'plastic',   kg: 45.5,  date: '15 Oct, 2:30 PM',   status: 'CONFIRMADO' },
  { id: '2', material: 'Cartón',             materialType: 'cardboard', kg: 120.0, date: '12 Oct, 10:15 AM',  status: 'CONFIRMADO' },
  { id: '3', material: 'Vidrio',             materialType: 'glass',     kg: 28.2,  date: '10 Oct, 4:45 PM',   status: 'CONFIRMADO' },
  { id: '4', material: 'Aluminio',           materialType: 'metals',    kg: 15.8,  date: '08 Oct, 11:20 AM',  status: 'CONFIRMADO' },
  { id: '5', material: 'Papel Archivo',      materialType: 'paper',     kg: 32.1,  date: '05 Oct, 9:00 AM',   status: 'PENDIENTE'  },
];

const STATUS_COLOR: Record<WeighingRecord['status'], string> = {
  CONFIRMADO: theme.colors.success,
  PENDIENTE:  theme.colors.warning,
  RECHAZADO:  theme.colors.error,
};

const FILTER_TABS: FilterTab[] = ['Día', 'Semana', 'Mes'];

export default function CitizenWeighingsScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('Mes');
  const [search, setSearch] = useState('');

  const totalKg = DEMO_WEIGHINGS
    .filter((w) => w.status === 'CONFIRMADO')
    .reduce((sum, w) => sum + w.kg, 0);

  const filtered = DEMO_WEIGHINGS.filter((w) =>
    w.material.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Histórico de Pesajes</Text>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Tarjeta resumen ───────────────────────────── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Acumulado</Text>
          <Text style={styles.summaryValue}>
            {totalKg.toLocaleString('es-CO', { minimumFractionDigits: 0 })} kg
          </Text>
          <View style={styles.summaryBadge}>
            <Ionicons name="trending-up" size={12} color={theme.colors.success} />
            <Text style={styles.summaryBadgeText}>+12% este mes</Text>
          </View>
        </View>

        {/* ── Filtros de período ────────────────────────── */}
        <View style={styles.filterRow}>
          {FILTER_TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                activeFilter === tab && styles.filterTabActive,
              ]}
              onPress={() => setActiveFilter(tab)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === tab && styles.filterTabTextActive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Buscador ──────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar pesaje por material..."
            placeholderTextColor={theme.colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search !== '' && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Lista de pesajes ──────────────────────────── */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="scale-outline"
              size={48}
              color={theme.colors.primaryMid}
            />
            <Text style={styles.emptyText}>
              No se encontraron pesajes con ese filtro
            </Text>
          </View>
        ) : (
          filtered.map((item) => (
            <MaterialItem
              key={item.id}
              name={item.material}
              timestamp={item.date}
              value={`${item.kg} kg`}
              valueColor={theme.colors.textPrimary}
              badge={item.status}
              badgeColor={STATUS_COLOR[item.status]}
              materialType={item.materialType}
            />
          ))
        )}
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
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Resumen ──────────────────────────────────────────────
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.extrabold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  summaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  summaryBadgeText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.success,
  },

  // ── Filtros ──────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    padding: 4,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
  },
  filterTabText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  filterTabTextActive: {
    color: theme.colors.textOnPrimary,
    fontWeight: theme.typography.weights.semibold,
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

  // ── Empty state ──────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: theme.spacing.huge,
    gap: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
