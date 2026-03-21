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
import { CustomButton } from '@/src/components/CustomButton';

interface WasteCategory {
  id: string;
  name: string;
  container: string;
  icon: keyof typeof Ionicons.glyphMap;
  sideIcon: keyof typeof Ionicons.glyphMap;
  borderColor: string;
  items: string[];
}

const WASTE_CATEGORIES: WasteCategory[] = [
  {
    id: 'organic',
    name: 'Orgánicos',
    container: 'Contenedor Verde',
    icon: 'sync-circle-outline',
    sideIcon: 'leaf',
    borderColor: theme.colors.primary,
    items: ['Restos de comida', 'Desechos agrícolas', 'Cáscaras de frutas'],
  },
  {
    id: 'recyclable',
    name: 'Aprovechables',
    container: 'Contenedor Blanco',
    icon: 'sync-circle-outline',
    sideIcon: 'archive-outline',
    borderColor: theme.colors.textSecondary,
    items: ['Plástico, Cartón y Vidrio', 'Papel y Metales', 'Latas de aluminio'],
  },
  {
    id: 'non_recyclable',
    name: 'No Aprovechables',
    container: 'Contenedor Negro',
    icon: 'trash-outline',
    sideIcon: 'trash',
    borderColor: theme.colors.textPrimary,
    items: ['Papel higiénico', 'Servilletas usadas', 'Papeles metalizados'],
  },
];

export default function RecycleGuideScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredCategories = WASTE_CATEGORIES.filter(
    (cat) =>
      search === '' ||
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      cat.items.some((item) =>
        item.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <Ionicons name="sync-circle" size={28} color={theme.colors.primary} />
          <View style={{ width: 24 }} />
        </View>

        {/* ── Título ────────────────────────────────────── */}
        <Text style={styles.title}>Guía de Reciclaje</Text>
        <Text style={styles.subtitle}>
          Transforma tus residuos en vida para Zipaquirá{'\n'}
          Aprende a clasificar correctamente.
        </Text>

        {/* ── Buscador ──────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué quieres reciclar? Ej. Botella plástico"
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

        {/* ── Encabezado de categorías ───────────────────── */}
        <View style={styles.categoriesHeader}>
          <Text style={styles.categoriesTitle}>Categorías de Residuos</Text>
          <View style={styles.zipaBadge}>
            <Text style={styles.zipaBadgeText}>Zipaquirá Limpia</Text>
          </View>
        </View>

        {/* ── Tarjetas de categorías ────────────────────── */}
        {filteredCategories.map((cat) => (
          <View key={cat.id} style={styles.categoryCard}>
            {/* Borde izquierdo de color */}
            <View
              style={[styles.categoryBorder, { backgroundColor: cat.borderColor }]}
            />
            <View style={styles.categoryContent}>
              {/* Cabecera de la categoría */}
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleRow}>
                  <Ionicons
                    name={cat.icon}
                    size={20}
                    color={cat.borderColor}
                  />
                  <View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryContainer}>{cat.container}</Text>
                  </View>
                </View>
                <Ionicons
                  name={cat.sideIcon}
                  size={32}
                  color={cat.borderColor}
                  style={styles.categorySideIcon}
                />
              </View>
              {/* Lista de ítems */}
              {cat.items.map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <View
                    style={[
                      styles.categoryBullet,
                      { backgroundColor: cat.borderColor },
                    ]}
                  />
                  <Text style={styles.categoryItemText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* ── Botón puntos de recolección ───────────────── */}
        <CustomButton
          label="Ver puntos de recolección"
          leftIcon={
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.textOnPrimary}
            />
          }
          onPress={() => router.push('/(citizen)/routes')}
          style={styles.collectBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },

  // ── Títulos ──────────────────────────────────────────────
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.lg,
  },

  // ── Búsqueda ─────────────────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },

  // ── Cabecera de categorías ───────────────────────────────
  categoriesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  categoriesTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  zipaBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  zipaBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },

  // ── Tarjetas de categoría ────────────────────────────────
  categoryCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  categoryBorder: {
    width: 4,
  },
  categoryContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  categoryName: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  categoryContainer: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  categorySideIcon: {
    opacity: 0.7,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  categoryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryItemText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },

  // ── Botón ────────────────────────────────────────────────
  collectBtn: {
    marginTop: theme.spacing.md,
  },
});
