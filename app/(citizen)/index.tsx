import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { getNextWeekday } from '@/src/utils/date';

interface ServiceCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  helper: string;
  onPress: () => void;
}

const NEXT_PICKUP = {
  sector: 'Centro Histórico',
  time: '6:30 AM – 12:00 PM',
  wasteType: 'Aprovechables',
};

function ServiceCard({ icon, label, helper, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.serviceIconBg}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceLabel}>{label}</Text>
        <Text style={styles.serviceHelper}>{helper}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function CitizenHomeScreen() {
  const router = useRouter();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
  const today = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  const nextPickupDate = getNextWeekday(3).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerKicker}>{today}</Text>
            <Text style={styles.headerTitle}>{greeting}</Text>
          </View>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => router.push('/(citizen)/support')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.nextPickupCard}>
          <View style={styles.nextPickupHeader}>
            <Text style={styles.nextPickupTitle}>Próxima recolección</Text>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>Confirmada</Text>
            </View>
          </View>

          <View style={styles.nextPickupRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.nextPickupText}>{NEXT_PICKUP.sector}</Text>
          </View>
          <View style={styles.nextPickupRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.nextPickupText}>{nextPickupDate}</Text>
          </View>
          <View style={styles.nextPickupRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.nextPickupText}>{NEXT_PICKUP.time}</Text>
          </View>
          <View style={styles.nextPickupRow}>
            <Ionicons name="sync-circle-outline" size={16} color={theme.colors.primary} />
            <Text style={[styles.nextPickupText, styles.nextPickupTextStrong]}>{NEXT_PICKUP.wasteType}</Text>
          </View>

          <CustomButton
            label="Configurar horarios"
            variant="secondary"
            size="md"
            onPress={() => router.push('/(citizen)/schedule')}
            style={styles.nextPickupButton}
          />
        </View>

        <View style={styles.featuredCard}>
          <Text style={styles.featuredTitle}>Mejora tu separación en casa</Text>
          <Text style={styles.featuredDescription}>Tres hábitos que sí mejoran la calidad del material reciclable:</Text>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.bulletText}>Lava y seca envases antes de entregarlos.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.bulletText}>Separa orgánicos de aprovechables desde origen.</Text>
          </View>
          <View style={styles.bulletRow}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
            <Text style={styles.bulletText}>Evita mezclar vidrio roto sin protección.</Text>
          </View>
          <CustomButton
            label="Abrir guía de reciclaje"
            rightIcon={<Ionicons name="arrow-forward" size={16} color={theme.colors.textOnPrimary} />}
            onPress={() => router.push('/(citizen)/recycle-guide')}
            size="md"
            style={styles.featuredButton}
          />
        </View>

        <Text style={styles.servicesTitle}>Servicios ciudadanos</Text>
        <View style={styles.servicesGrid}>
          <ServiceCard
            icon="time-outline"
            label="Horarios"
            helper="Consulta por sector"
            onPress={() => router.push('/(citizen)/schedule')}
          />
          <ServiceCard
            icon="document-text-outline"
            label="PQRS"
            helper="Radica y haz seguimiento"
            onPress={() => router.push('/(citizen)/pqrs')}
          />
          <ServiceCard
            icon="sync-circle-outline"
            label="Guía de reciclaje"
            helper="Material por categoría"
            onPress={() => router.push('/(citizen)/recycle-guide')}
          />
          <ServiceCard
            icon="headset-outline"
            label="Soporte"
            helper="Atención y ayuda"
            onPress={() => router.push('/(citizen)/support')}
          />
        </View>

        <TouchableOpacity
          style={styles.helpCard}
          onPress={() => router.push('/(citizen)/help')}
          activeOpacity={0.85}
        >
          <View style={styles.helpIconBg}>
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>Centro de ayuda</Text>
            <Text style={styles.helpSubtitle}>Preguntas frecuentes y orientación rápida.</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerKicker: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    textTransform: 'capitalize',
  },
  headerTitle: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  helpBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  nextPickupCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  nextPickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  nextPickupTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  statusChip: {
    backgroundColor: theme.colors.successLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  statusChipText: {
    color: theme.colors.success,
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
  },
  nextPickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  nextPickupText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  nextPickupTextStrong: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  nextPickupButton: {
    marginTop: theme.spacing.md,
  },

  featuredCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featuredTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featuredDescription: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  featuredButton: {
    marginTop: theme.spacing.md,
  },

  servicesTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  servicesGrid: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  serviceCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  serviceIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceContent: {
    flex: 1,
  },
  serviceLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  serviceHelper: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  helpIconBg: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { flex: 1 },
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
