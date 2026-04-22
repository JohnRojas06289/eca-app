import { useMemo, useState } from 'react';
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
import { formatDateTime } from '@/src/utils/date';

type MaterialCategory = 'all' | 'plastic' | 'cardboard' | 'glass' | 'metals' | 'organic' | 'paper';
type TrendDirection = 'up' | 'down' | 'stable';

interface PriceItem {
  id: string;
  name: string;
  category: Exclude<MaterialCategory, 'all'>;
  pricePerKg: number;
  previousPrice: number;
  trend: TrendDirection;
  icon: string;
  color: string;
  bgColor: string;
  updatedAt: Date;
}

const now = new Date();
const PRICES: PriceItem[] = [
  { id: '1', name: 'Plástico PET', category: 'plastic', pricePerKg: 800, previousPrice: 750, trend: 'up', icon: 'water-outline', color: theme.colors.plastic, bgColor: theme.colors.plasticBg, updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
  { id: '2', name: 'Plástico PEAD', category: 'plastic', pricePerKg: 600, previousPrice: 600, trend: 'stable', icon: 'water-outline', color: theme.colors.plastic, bgColor: theme.colors.plasticBg, updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
  { id: '3', name: 'Cartón Corrugado', category: 'cardboard', pricePerKg: 350, previousPrice: 380, trend: 'down', icon: 'albums-outline', color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, updatedAt: new Date(now.getTime() - 25 * 60 * 60 * 1000) },
  { id: '4', name: 'Vidrio Transparente', category: 'glass', pricePerKg: 120, previousPrice: 120, trend: 'stable', icon: 'wine-outline', color: theme.colors.glass, bgColor: theme.colors.glassBg, updatedAt: new Date(now.getTime() - 49 * 60 * 60 * 1000) },
  { id: '5', name: 'Vidrio de Color', category: 'glass', pricePerKg: 80, previousPrice: 80, trend: 'stable', icon: 'wine-outline', color: theme.colors.glass, bgColor: theme.colors.glassBg, updatedAt: new Date(now.getTime() - 49 * 60 * 60 * 1000) },
  { id: '6', name: 'Aluminio', category: 'metals', pricePerKg: 2200, previousPrice: 2000, trend: 'up', icon: 'hardware-chip-outline', color: theme.colors.metals, bgColor: theme.colors.metalsBg, updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
  { id: '7', name: 'Cobre', category: 'metals', pricePerKg: 8000, previousPrice: 8200, trend: 'down', icon: 'hardware-chip-outline', color: theme.colors.metals, bgColor: theme.colors.metalsBg, updatedAt: new Date(now.getTime() - 28 * 60 * 60 * 1000) },
  { id: '8', name: 'Chatarra Ferrosa', category: 'metals', pricePerKg: 400, previousPrice: 380, trend: 'up', icon: 'hardware-chip-outline', color: theme.colors.metals, bgColor: theme.colors.metalsBg, updatedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
  { id: '9', name: 'Papel Archivo', category: 'paper', pricePerKg: 500, previousPrice: 500, trend: 'stable', icon: 'document-outline', color: theme.colors.paper, bgColor: theme.colors.paperBg, updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
  { id: '10', name: 'Orgánicos', category: 'organic', pricePerKg: 0, previousPrice: 0, trend: 'stable', icon: 'leaf-outline', color: theme.colors.organic, bgColor: theme.colors.organicBg, updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) },
];

const CATEGORIES: { key: MaterialCategory; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'plastic', label: 'Plástico' },
  { key: 'cardboard', label: 'Cartón' },
  { key: 'glass', label: 'Vidrio' },
  { key: 'metals', label: 'Metales' },
  { key: 'paper', label: 'Papel' },
  { key: 'organic', label: 'Orgánicos' },
];

const TREND_CONFIG: Record<TrendDirection, { icon: string; color: string; label: string }> = {
  up: { icon: 'trending-up-outline', color: theme.colors.success, label: 'Subió' },
  down: { icon: 'trending-down-outline', color: theme.colors.error, label: 'Bajó' },
  stable: { icon: 'remove-outline', color: theme.colors.textMuted, label: 'Estable' },
};

export default function PricesScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('all');
  const [search, setSearch] = useState('');

  const filtered = PRICES.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const highlights = useMemo(() => {
    const ups = PRICES.filter((p) => p.trend === 'up').length;
    const downs = PRICES.filter((p) => p.trend === 'down').length;
    return { ups, downs };
  }, []);
  const latestUpdate = useMemo(() => {
    const latest = PRICES.reduce((acc, item) => (item.updatedAt > acc ? item.updatedAt : acc), PRICES[0].updatedAt);
    return formatDateTime(latest);
  }, []);

  function priceDiff(current: number, previous: number): string {
    const diff = current - previous;
    if (diff === 0) return '';
    return diff > 0 ? `+$${diff.toLocaleString('es-CO')}` : `-$${Math.abs(diff).toLocaleString('es-CO')}`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Precios</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.updateBanner}>
        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.updateText}>Actualizado: {latestUpdate}</Text>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightRow}>
          <Ionicons name="trending-up-outline" size={16} color={theme.colors.success} />
          <Text style={styles.insightText}>{highlights.ups} materiales subieron de precio.</Text>
        </View>
        <View style={styles.insightRow}>
          <Ionicons name="trending-down-outline" size={16} color={theme.colors.error} />
          <Text style={styles.insightText}>{highlights.downs} materiales bajaron de precio.</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar material..."
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

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No se encontraron materiales</Text>
        ) : (
          filtered.map((item) => {
            const trend = TREND_CONFIG[item.trend];
            const diff = priceDiff(item.pricePerKg, item.previousPrice);
            return (
              <View key={item.id} style={styles.priceCard}>
                <View style={[styles.priceIconBg, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>

                <View style={styles.priceInfo}>
                  <Text style={styles.priceName}>{item.name}</Text>
                  <View style={styles.trendRow}>
                    <Ionicons name={trend.icon as any} size={13} color={trend.color} />
                    <Text style={[styles.trendLabel, { color: trend.color }]}>
                      {trend.label}{diff !== '' ? ` (${diff})` : ''}
                    </Text>
                    <Text style={styles.updatedAt}>
                      · {item.updatedAt.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                    </Text>
                  </View>
                </View>

                <View style={styles.priceRight}>
                  <Text style={styles.priceValue}>
                    {item.pricePerKg === 0 ? 'Sin valor' : `$${item.pricePerKg.toLocaleString('es-CO')}`}
                  </Text>
                  {item.pricePerKg > 0 && <Text style={styles.priceUnit}>/kg</Text>}
                </View>
              </View>
            );
          })
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Precios referenciales en COP. Pueden variar según calidad, humedad y volumen de entrega.
          </Text>
        </View>
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
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.md,
  },
  updateText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },

  insightCard: {
    marginHorizontal: theme.spacing.screen,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  insightText: {
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

  categoriesScroll: {
    paddingHorizontal: theme.spacing.screen,
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.lg,
    height: theme.sizes.chipHeight,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  categoryLabelActive: { color: theme.colors.textOnPrimary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  priceCard: {
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
  priceIconBg: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInfo: { flex: 1 },
  priceName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: theme.typography.sizes.small,
  },
  updatedAt: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginLeft: 4,
  },
  priceRight: { alignItems: 'flex-end' },
  priceValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  priceUnit: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
  },

  empty: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },

  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
