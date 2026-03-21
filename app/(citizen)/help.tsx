import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: '1',
    question: '¿Cómo programo una recolección?',
    answer:
      'Ve a la sección "Horarios" desde el Portal Ciudadano. Selecciona tu barrio, los días y la hora preferida. El sistema asignará la ruta más cercana disponible.',
  },
  {
    id: '2',
    question: '¿Qué materiales son reciclables?',
    answer:
      'Aceptamos plástico (PET, PEAD), papel, cartón, vidrio y metales limpios. Asegúrate de que los envases estén vacíos y secos antes de entregarlos.',
  },
  {
    id: '3',
    question: '¿Cuándo recibo mis puntos?',
    answer:
      'Los puntos se acreditan dentro de las 24 horas siguientes al pesaje confirmado por el operario. Puedes revisarlos en tu perfil en la sección "Impacto Ambiental".',
  },
  {
    id: '4',
    question: '¿Puedo cambiar mi ubicación?',
    answer:
      'Sí. Ve a tu Perfil → Información Personal → dirección, y actualiza tu ubicación. Los cambios aplican desde la próxima semana de recolección.',
  },
];

interface HelpCategoryProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function HelpCategory({ icon, label, onPress }: HelpCategoryProps) {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.categoryIconBg}>
        <Ionicons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function HelpScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('2'); // Abierto por defecto

  function toggleFAQ(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const filteredFAQ = FAQ_ITEMS.filter(
    (item) =>
      search === '' ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()),
  );

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
        <Text style={styles.headerTitle}>Centro de Ayuda</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Buscador ──────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textMuted}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar en la ayuda..."
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

        {/* ── Categorías ────────────────────────────────── */}
        {search === '' && (
          <>
            <Text style={styles.sectionLabel}>CATEGORÍAS</Text>
            <View style={styles.categoriesGrid}>
              <HelpCategory
                icon="sync-circle-outline"
                label="Sobre el Reciclaje"
                onPress={() => router.push('/(citizen)/recycle-guide')}
              />
              <HelpCategory
                icon="phone-portrait-outline"
                label="Uso de la App"
                onPress={() => {}}
              />
              <HelpCategory
                icon="wallet-outline"
                label="Pesajes y Pagos"
                onPress={() => router.push('/(citizen)/weighings')}
              />
              <HelpCategory
                icon="person-circle-outline"
                label="Mi Perfil"
                onPress={() => router.push('/(citizen)/profile')}
              />
            </View>
          </>
        )}

        {/* ── Preguntas frecuentes ──────────────────────── */}
        <Text style={styles.sectionLabel}>PREGUNTAS FRECUENTES</Text>
        {filteredFAQ.length === 0 ? (
          <Text style={styles.noResults}>
            No se encontraron resultados para "{search}"
          </Text>
        ) : (
          filteredFAQ.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <View
                key={item.id}
                style={[styles.faqItem, isExpanded && styles.faqItemExpanded]}
              >
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFAQ(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.faqQuestionText, isExpanded && styles.faqQuestionTextActive]}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isExpanded ? theme.colors.primary : theme.colors.textMuted}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </View>
            );
          })
        )}

        {/* ── CTA de soporte ────────────────────────────── */}
        <View style={styles.supportCTA}>
          <View style={styles.supportCTAIconBg}>
            <Ionicons name="headset" size={28} color={theme.colors.primary} />
          </View>
          <Text style={styles.supportCTATitle}>¿Aún tienes dudas?</Text>
          <Text style={styles.supportCTASubtitle}>
            Estamos aquí para ayudarte. Chatea con nuestro equipo de soporte técnico.
          </Text>
          <CustomButton
            label="Contactar Soporte"
            leftIcon={
              <Ionicons
                name="chatbubble-outline"
                size={18}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={() => router.push('/(citizen)/support')}
          />
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

  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
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

  // ── Secciones ────────────────────────────────────────────
  sectionLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.lg,
  },

  // ── Categorías ───────────────────────────────────────────
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  categoryIconBg: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  // ── FAQ ──────────────────────────────────────────────────
  faqItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  faqItemExpanded: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  faqQuestionText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  faqQuestionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  faqAnswer: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  noResults: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingVertical: theme.spacing.xxl,
  },

  // ── CTA Soporte ──────────────────────────────────────────
  supportCTA: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  supportCTAIconBg: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportCTATitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  supportCTASubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
  },
});
