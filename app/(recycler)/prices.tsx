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
  updatedAt: string;
}

const PRICES: PriceItem[] = [
  { id: '1', name: 'Plástico PET',         category: 'plastic',   pricePerKg: 800,  previousPrice: 750,  trend: 'up',     icon: 'water-outline',          color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   updatedAt: 'Hoy' },
  { id: '2', name: 'Plástico PEAD',        category: 'plastic',   pricePerKg: 600,  previousPrice: 600,  trend: 'stable', icon: 'water-outline',          color: theme.colors.plastic,   bgColor: theme.colors.plasticBg,   updatedAt: 'Hoy' },
  { id: '3', name: 'Cartón Corrugado',     category: 'cardboard', pricePerKg: 350,  previousPrice: 380,  trend: 'down',   icon: 'albums-outline',          color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg, updatedAt: 'Ayer' },
  { id: '4', name: 'Vidrio Transparente',  category: 'glass',     pricePerKg: 120,  previousPrice: 120,  trend: 'stable', icon: 'wine-outline',            color: theme.colors.glass,     bgColor: theme.colors.glassBg,     updatedAt: 'Hace 2 días' },
  { id: '5', name: 'Vidrio de Color',      category: 'glass',     pricePerKg: 80,   previousPrice: 80,   trend: 'stable', icon: 'wine-outline',            color: theme.colors.glass,     bgColor: theme.colors.glassBg,     updatedAt: 'Hace 2 días' },
  { id: '6', name: 'Aluminio',             category: 'metals',    pricePerKg: 2200, previousPrice: 2000, trend: 'up',     icon: 'hardware-chip-outline',   color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    updatedAt: 'Hoy' },
  { id: '7', name: 'Cobre',               category: 'metals',    pricePerKg: 8000, previousPrice: 8200, trend: 'down',   icon: 'hardware-chip-outline',   color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    updatedAt: 'Ayer' },
  { id: '8', name: 'Chatarra Ferrosa',    category: 'metals',    pricePerKg: 400,  previousPrice: 380,  trend: 'up',     icon: 'hardware-chip-outline',   color: theme.colors.metals,    bgColor: theme.colors.metalsBg,    updatedAt: 'Hoy' },
  { id: '9', name: 'Papel Archivo',       category: 'paper',     pricePerKg: 500,  previousPrice: 500,  trend: 'stable', icon: 'document-outline',        color: theme.colors.paper,     bgColor: theme.colors.paperBg,     updatedAt: 'Hoy' },
  { id: '10', name: 'Orgánicos',          category: 'organic',   pricePerKg: 0,    previousPrice: 0,    trend: 'stable', icon: 'leaf-outline',            color: theme.colors.organic,   bgColor: theme.colors.organicBg,   updatedAt: 'Hoy' },
];

const CATEGORIES: { key: MaterialCategory; label: string }[] = [
  { key: 'all',      label: 'Todos'    },
  { key: 'plastic',  label: 'Plástico' },
  { key: 'cardboard',label: 'Cartón'   },
  { key: 'glass',    label: 'Vidrio'   },
  { key: 'metals',   label: 'Metales'  },
  { key: 'paper',    label: 'Papel'    },
  { key: 'organic',  label: 'Orgánicos'},
];

const TREND_CONFIG: Record<TrendDirection, { icon: string; color: string; label: string }> = {
  up:     { icon: 'trending-up-outline',   color: theme.colors.success, label: 'Subió'   },
  down:   { icon: 'trending-down-outline', color: theme.colors.error,   label: 'Bajó'    },
  stable: { icon: 'remove-outline',        color: theme.colors.textMuted, label: 'Estable' },
};

export default function PricesScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<MaterialCategory>('all');
  const [search,         setSearch]         = useState('');

  const filtered = PRICES.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch   =
      search === '' || p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function formatPrice(price: number): string {
    return price === 0 ? 'Sin valor' : `$${price.toLocaleString('es-CO')}/kg`;
  }

  function priceDiff(current: number, previous: number): string {
    const diff = current - previous;
    if (diff === 0) return '';
    return diff > 0 ? `+$${diff.toLocaleString('es-CO')}` : `-$${Math.abs(diff).toLocaleString('es-CO')}`;
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
        <Text style={styles.headerTitle}>Tabla de Precios</Text>
        <Ionicons name="pricetag-outline" size={24} color={theme.colors.primary} />
      </View>

      {/* ── Banner de actualización ───────────────────────── */}
      <View style={styles.updateBanner}>
        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.updateText}>
          Precios actualizados por la ECA Zipaquirá · Hoy, 7:00 AM
        </Text>
      </View>

      {/* ── Búsqueda ──────────────────────────────────────── */}
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

      {/* ── Filtros por categoría ─────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setActiveCategory(cat.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.categoryLabel, isActive && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Lista de precios ──────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No se encontraron materiales</Text>
        ) : (
          filtered.map((item) => {
            const trend = TREND_CONFIG[item.trend];
            const diff  = priceDiff(item.pricePerKg, item.previousPrice);
            return (
              <View key={item.id} style={styles.priceCard}>
                {/* Ícono */}
                <View style={[styles.priceIconBg, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon as any} size={22} color={item.color} />
                </View>

                {/* Info */}
                <View style={styles.priceInfo}>
                  <Text style={styles.priceName}>{item.name}</Text>
                  <View style={styles.trendRow}>
                    <Ionicons name={trend.icon as any} size={13} color={trend.color} />
                    <Text style={[styles.trendLabel, { color: trend.color }]}>
                      {trend.label}
                      {diff !== '' ? ` (${diff})` : ''}
                    </Text>
                    <Text style={styles.updatedAt}>· {item.updatedAt}</Text>
                  </View>
                </View>

                {/* Precio */}
                <View style={styles.priceRight}>
                  <Text style={styles.priceValue}>
                    {item.pricePerKg === 0
                      ? 'Sin valor'
                      : `$${item.pricePerKg.toLocaleString('es-CO')}`}
                  </Text>
                  {item.pricePerKg > 0 && (
                    <Text style={styles.priceUnit}>/kg</Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* ── Nota legal ────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={theme.colors.textMuted} />
          <Text style={styles.disclaimerText}>
            Los precios son referenciales y pueden variar según calidad y humedad del material.
            Precios en pesos colombianos (COP).
          </Text>
        </View>
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
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  // ── Banner ───────────────────────────────────────────────
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
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },
  categoryLabelActive: { color: theme.colors.textOnPrimary },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Tarjeta de precio ────────────────────────────────────
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  priceIconBg: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  priceInfo: { flex: 1 },
  priceName: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
  },
  updatedAt: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
  priceRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    flexShrink: 0,
  },
  priceValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  priceUnit: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Vacío ────────────────────────────────────────────────
  empty: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },

  // ── Disclaimer ───────────────────────────────────────────
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.separator,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  disclaimerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.sizes.small * theme.typography.lineHeights.normal,
  },
});
