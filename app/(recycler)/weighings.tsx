import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { MaterialItem } from '@/src/components/MaterialItem';
import type { MaterialType } from '@/src/components/MaterialItem';
import { formatShortDateTime } from '@/src/utils/date';

type FilterPeriod = 'day' | 'week' | 'month';

interface WeighingRecord {
  id: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  valuePerKg: number;
  date: Date;
  location: string;
  status: 'confirmed' | 'pending';
}

const now = new Date();
const WEIGHINGS: WeighingRecord[] = [
  { id: '1', material: 'Plástico PET', materialType: 'plastic', kg: 12.5, valuePerKg: 800, date: new Date(now.getTime() - 90 * 60 * 1000), location: 'Centro Histórico', status: 'confirmed' },
  { id: '2', material: 'Cartón Corrugado', materialType: 'cardboard', kg: 45.0, valuePerKg: 350, date: new Date(now.getTime() - 3 * 60 * 60 * 1000), location: 'San Pablo', status: 'confirmed' },
  { id: '3', material: 'Vidrio Transparente', materialType: 'glass', kg: 8.2, valuePerKg: 120, date: new Date(now.getTime() - 26 * 60 * 60 * 1000), location: 'El Jardín', status: 'pending' },
  { id: '4', material: 'Papel Archivo', materialType: 'paper', kg: 22.0, valuePerKg: 500, date: new Date(now.getTime() - 31 * 60 * 60 * 1000), location: 'Centro Histórico', status: 'confirmed' },
  { id: '5', material: 'Aluminio', materialType: 'metals', kg: 3.4, valuePerKg: 2200, date: new Date(now.getTime() - 50 * 60 * 60 * 1000), location: 'La Granja', status: 'confirmed' },
];

const FILTERS: { key: FilterPeriod; label: string }[] = [
  { key: 'day', label: 'Hoy' },
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mes' },
];

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', color: theme.colors.success },
  pending: { label: 'Pendiente', color: theme.colors.warning },
};

export default function RecyclerWeighingsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterPeriod>('week');
  const [search, setSearch] = useState('');

  const periodStart = useMemo(() => {
    const base = new Date();
    if (filter === 'day') {
      base.setHours(0, 0, 0, 0);
      return base;
    }
    if (filter === 'week') {
      base.setDate(base.getDate() - 7);
      return base;
    }
    base.setMonth(base.getMonth() - 1);
    return base;
  }, [filter]);

  const byPeriod =
    WEIGHINGS.filter((w) => w.date >= periodStart);

  const filtered = byPeriod.filter(
    (w) =>
      search === '' ||
      w.material.toLowerCase().includes(search.toLowerCase()) ||
      w.location.toLowerCase().includes(search.toLowerCase()),
  );

  const summary = useMemo(() => {
    const totalKg = byPeriod.reduce((acc, item) => acc + item.kg, 0);
    const totalValue = byPeriod.reduce((acc, item) => acc + item.kg * item.valuePerKg, 0);
    const pending = byPeriod.filter((item) => item.status === 'pending').length;
    return { totalKg, totalValue, pending };
  }, [byPeriod]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerKicker}>Operación personal</Text>
          <Text style={styles.headerTitle}>Mis pesajes</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(recycler)/new-weighing')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="add-circle-outline" size={26} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del período</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Recolectado</Text>
              <Text style={styles.summaryValue}>{summary.totalKg.toFixed(1)} kg</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Valor estimado</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>${Math.round(summary.totalValue).toLocaleString('es-CO')}</Text>
            </View>
          </View>
          <Text style={styles.summaryHint}>{summary.pending} registros pendientes por confirmar.</Text>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Registros</Text>
          <Text style={styles.sectionCount}>{filtered.length}</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="scale-outline" size={32} color={theme.colors.textMuted} />
            <Text style={styles.emptyTitle}>No hay pesajes</Text>
            <Text style={styles.emptySubtitle}>Intenta con otro filtro o crea un nuevo registro.</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const s = STATUS_CONFIG[item.status];
            return (
              <MaterialItem
                key={item.id}
                name={item.material}
                subtitle={`${item.location} · $${item.valuePerKg.toLocaleString('es-CO')}/kg`}
                timestamp={formatShortDateTime(item.date)}
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
  headerKicker: {
    fontSize: theme.typography.sizes.tiny,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: theme.colors.textMuted,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 36, backgroundColor: theme.colors.border },
  summaryLabel: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  summaryHint: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  filterRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.xl,
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: theme.sizes.inputHeight,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  sectionCount: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
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
});
