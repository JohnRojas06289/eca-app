import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

interface ServiceCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

function ServiceCard({ icon, label, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.serviceIconBg}>
        <Ionicons name={icon} size={28} color={theme.colors.primary} />
      </View>
      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CitizenHomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={{ width: 26 }} />
          <Text style={styles.headerTitle}>Portal Ciudadano</Text>
          <TouchableOpacity
            onPress={() => router.push('/(citizen)/support')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="help-circle-outline"
              size={26}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Sección educativa ─────────────────────────── */}
        <Text style={styles.sectionTitle}>Educación Ambiental</Text>
        <Text style={styles.sectionSubtitle}>
          Transformando nuestra ciudad juntos
        </Text>

        {/* Hero image */}
        <View style={styles.heroImagePlaceholder}>
          {/* Reemplazar con:
              <Image source={require('@/assets/images/hero-recycling.jpg')}
                     style={styles.heroImage} resizeMode="cover" /> */}
          <Ionicons name="leaf" size={48} color={theme.colors.primaryMid} />
          <Text style={styles.heroImageText}>Imagen educativa</Text>
        </View>

        {/* ── Tarjeta destacada ─────────────────────────── */}
        <View style={styles.featuredCard}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>DESTACADO</Text>
          </View>
          <Text style={styles.featuredTitle}>
            Cursos y videos de aprovechamiento
          </Text>
          <Text style={styles.featuredDescription}>
            Aprende técnicas profesionales para transformar tus residuos orgánicos
            y cuidar el planeta desde casa.
          </Text>
          <CustomButton
            label="Ver guía de reciclaje"
            rightIcon={
              <Ionicons
                name="arrow-forward"
                size={16}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={() => router.push('/(citizen)/recycle-guide')}
            size="md"
          />
        </View>

        {/* ── Servicios ciudadanos ───────────────────────── */}
        <Text style={styles.servicesTitle}>Servicios Ciudadanos</Text>
        <View style={styles.servicesGrid}>
          <ServiceCard
            icon="time-outline"
            label="Horarios de Recolección"
            onPress={() => router.push('/(citizen)/schedule')}
          />
          <ServiceCard
            icon="document-text-outline"
            label="Radicar PQRS"
            onPress={() => router.push('/(citizen)/pqrs')}
          />
          <ServiceCard
            icon="sync-circle-outline"
            label="Guía de Reciclaje"
            onPress={() => router.push('/(citizen)/recycle-guide')}
          />
          <ServiceCard
            icon="headset-outline"
            label="Soporte"
            onPress={() => router.push('/(citizen)/support')}
          />
        </View>

        {/* ── Tarjeta de ayuda ──────────────────────────── */}
        <TouchableOpacity
          style={styles.helpCard}
          onPress={() => router.push('/(citizen)/help')}
          activeOpacity={0.8}
        >
          <View style={styles.helpIconBg}>
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>¿Tienes dudas?</Text>
            <Text style={styles.helpSubtitle}>
              Consulta nuestra sección de preguntas frecuentes.
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textMuted}
          />
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  // ── Sección educativa ────────────────────────────────────
  sectionTitle: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },

  // ── Hero image ───────────────────────────────────────────
  heroImagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  heroImageText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primaryMid,
  },

  // ── Tarjeta destacada ────────────────────────────────────
  featuredCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  featuredBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.6,
  },
  featuredTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  featuredDescription: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.lg,
  },

  // ── Servicios ────────────────────────────────────────────
  servicesTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  serviceCard: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  serviceIconBg: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },

  // ── Tarjeta de ayuda ─────────────────────────────────────
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  helpIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  helpSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
});
