import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { MaterialItem } from '@/src/components/MaterialItem';
import type { MaterialType } from '@/src/components/MaterialItem';

type FilterPeriod = 'day' | 'week' | 'month';

interface WeighingRecord {
  id: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  valuePerKg: number;
  timestamp: string;
  location: string;
  status: 'confirmed' | 'pending';
}

const WEIGHINGS: WeighingRecord[] = [
  { id: '1', material: 'Plástico PET',        materialType: 'plastic',   kg: 12.5, valuePerKg: 800,  timestamp: 'Hoy, 10:30 AM',  location: 'Zipaquirá Centro',  status: 'confirmed' },
  { id: '2', material: 'Cartón Corrugado',    materialType: 'cardboard', kg: 45.0, valuePerKg: 350,  timestamp: 'Hoy, 09:15 AM',  location: 'San Pablo',         status: 'confirmed' },
  { id: '3', material: 'Vidrio Transparente', materialType: 'glass',     kg: 8.2,  valuePerKg: 120,  timestamp: 'Ayer, 4:15 PM',  location: 'El Jardín',         status: 'pending'   },
  { id: '4', material: 'Papel Archivo',       materialType: 'paper',     kg: 22.0, valuePerKg: 500,  timestamp: 'Ayer, 11:20 AM', location: 'Zipaquirá Centro',  status: 'confirmed' },
  { id: '5', material: 'Aluminio',            materialType: 'metals',    kg: 3.4,  valuePerKg: 2200, timestamp: 'Hace 2 días',    location: 'La Granja',         status: 'confirmed' },
];

const FILTERS: { key: FilterPeriod; label: string }[] = [
  { key: 'day',   label: 'Hoy'    },
  { key: 'week',  label: 'Semana' },
  { key: 'month', label: 'Mes'    },
];

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', color: theme.colors.success,  bgColor: theme.colors.successLight },
  pending:   { label: 'Pendiente',  color: theme.colors.warning,  bgColor: theme.colors.warningLight  },
};

const TOTAL_KG    = 91.1;
const TOTAL_VALUE = 64_380;

export default function RecyclerWeighingsScreen() {
  const router = useRouter();
  const [filter, setFilter]   = useState<FilterPeriod>('week');
  const [search, setSearch]   = useState('');

  const byPeriod = filter === 'day'
    ? WEIGHINGS.filter((w) => w.timestamp.startsWith('Hoy'))
    : filter === 'week'
    ? WEIGHINGS.slice(0, 4)
    : WEIGHINGS;

  const filtered = byPeriod.filter(
    (w) =>
      search === '' ||
      w.material.toLowerCase().includes(search.toLowerCase()) ||
      w.location.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pesajes</Text>
        <TouchableOpacity
          onPress={() => router.push('/(recycler)/new-weighing')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add-circle-outline" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Resumen del período ────────────────────────── */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>TOTAL RECOLECTADO</Text>
              <Text style={styles.summaryValue}>{TOTAL_KG} kg</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>VALOR ESTIMADO</Text>
              <Text style={[styles.summaryValue, styles.summaryValueGreen]}>
                ${TOTAL_VALUE.toLocaleString('es-CO')}
              </Text>
            </View>
          </View>
          <View style={styles.summaryFooter}>
            <Ionicons name="trending-up-outline" size={14} color={theme.colors.success} />
            <Text style={styles.summaryTrend}>+18% vs semana anterior</Text>
          </View>
        </View>

        {/* ── Filtros período ───────────────────────────── */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Buscador ──────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar material o ubicación..."
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

        {/* ── Lista de pesajes ──────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.sectionTitle}>Registros</Text>
          <Text style={styles.sectionCount}>{filtered.length}</Text>
        </View>

        {filtered.length === 0 ? (
          <Text style={styles.empty}>No se encontraron resultados</Text>
        ) : (
          filtered.map((item) => {
            const s = STATUS_CONFIG[item.status];
            return (
              <MaterialItem
                key={item.id}
                name={item.material}
                subtitle={item.location}
                timestamp={item.timestamp}
                value={`${item.kg} kg`}
                valueColor={theme.colors.primary}
                materialType={item.materialType}
                badge={s.label}
                badgeColor={s.color}
                showChevron
                onPress={() => {}}
              />
            );
          })
        )}
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
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40, backgroundColor: theme.colors.border },
  summaryLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  summaryValueGreen: { color: theme.colors.primary },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  summaryTrend: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Filtros ──────────────────────────────────────────────
  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
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

  // ── Búsqueda ─────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },

  // ── Sección ──────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  sectionCount: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
  },
  empty: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },
});
