import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { StatCard } from '@/src/components/StatCard';
import { MaterialItem } from '@/src/components/MaterialItem';
import { CustomButton } from '@/src/components/CustomButton';
import { useAuth } from '@/src/hooks/useAuth';
import type { MaterialType } from '@/src/components/MaterialItem';
import { formatLongDate, formatShortDateTime } from '@/src/utils/date';

interface RecentActivity {
  id: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  timestamp: string;
  location: string;
  status: 'confirmed' | 'pending';
}

const now = new Date();
const RECENT_ACTIVITY: RecentActivity[] = [
  {
    id: '1',
    material: 'Plástico PET',
    materialType: 'plastic',
    kg: 12.5,
    timestamp: formatShortDateTime(new Date(now.getTime() - 50 * 60 * 1000)),
    location: 'Centro Histórico',
    status: 'confirmed',
  },
  {
    id: '2',
    material: 'Cartón corrugado',
    materialType: 'cardboard',
    kg: 45,
    timestamp: formatShortDateTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
    location: 'San Pablo',
    status: 'confirmed',
  },
  {
    id: '3',
    material: 'Vidrio transparente',
    materialType: 'glass',
    kg: 8.2,
    timestamp: formatShortDateTime(new Date(now.getTime() - 18 * 60 * 60 * 1000)),
    location: 'La Granja',
    status: 'pending',
  },
];

export default function RecyclerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Reciclador';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarInitial}>{firstName[0]?.toUpperCase()}</Text>
              </View>
            )}
            <View>
              <Text style={styles.headerKicker}>Jornada activa</Text>
              <Text style={styles.headerName}>Hola, {firstName}</Text>
              <Text style={styles.headerSubtitle}>{formatLongDate()}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(recycler)/alerts')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <StatCard
          variant="hero"
          label="MATERIAL DEL DÍA"
          value="65.7"
          unit="kg"
          trend="2 pesajes por confirmar"
          trendDirection="neutral"
          style={styles.heroCard}
        />

        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <Text style={styles.routeTitle}>Ruta en curso</Text>
            <View style={styles.routeChip}>
              <Text style={styles.routeChipText}>En ejecución</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <Ionicons name="map-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.routeText}>Centro Histórico · Parada 6 de 14</Text>
          </View>
          <View style={styles.routeRow}>
            <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.routeText}>Siguiente punto: Calle 5 con Carrera 10</Text>
          </View>
          <View style={styles.routeRow}>
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.routeText}>ETA: 12 minutos</Text>
          </View>

          <View style={styles.routeActions}>
            <CustomButton
              label="Ver ruta"
              variant="secondary"
              size="md"
              onPress={() => router.push('/(recycler)/routes')}
              style={styles.flexBtn}
            />
            <CustomButton
              label="Reportar incidencia"
              size="md"
              onPress={() => router.push('/(recycler)/report-incident')}
              style={styles.flexBtn}
            />
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            variant="compact"
            label="Ingresos est."
            value="$450.000"
            icon="cash-outline"
            iconColor={theme.colors.primary}
            style={styles.statCardHalf}
          />
          <StatCard
            variant="compact"
            label="Confirmados"
            value="5"
            icon="checkmark-circle-outline"
            iconColor={theme.colors.success}
            iconBgColor={theme.colors.successLight}
            style={styles.statCardHalf}
          />
        </View>

        <View style={styles.quickActions}>
          <CustomButton
            label="Registrar pesaje"
            leftIcon={<Ionicons name="add-circle-outline" size={18} color={theme.colors.textOnPrimary} />}
            onPress={() => router.push('/(recycler)/new-weighing')}
            size="md"
          />
          <CustomButton
            label="Validar pesajes"
            variant="secondary"
            leftIcon={<Ionicons name="checkmark-done-outline" size={18} color={theme.colors.primary} />}
            onPress={() => router.push('/(recycler)/validate')}
            size="md"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          <TouchableOpacity onPress={() => router.push('/(recycler)/weighings')}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {RECENT_ACTIVITY.map((item) => (
          <MaterialItem
            key={item.id}
            name={item.material}
            subtitle={item.location}
            timestamp={item.timestamp}
            value={`${item.kg} kg`}
            valueColor={theme.colors.primary}
            materialType={item.materialType}
            badge={item.status === 'confirmed' ? 'CONFIRMADO' : 'PENDIENTE'}
            badgeColor={item.status === 'confirmed' ? theme.colors.success : theme.colors.warning}
            onPress={() => router.push('/(recycler)/weighings')}
            showChevron
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
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
    paddingBottom: theme.spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  headerAvatar: {
    width: theme.sizes.avatarMd,
    height: theme.sizes.avatarMd,
    borderRadius: theme.radius.circle,
  },
  headerAvatarFallback: {
    width: theme.sizes.avatarMd,
    height: theme.sizes.avatarMd,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarInitial: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  headerKicker: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  headerName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  heroCard: {
    marginBottom: theme.spacing.lg,
  },

  routeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  routeTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  routeChip: {
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  routeChipText: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.info,
    fontWeight: theme.typography.weights.semibold,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  routeText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  routeActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  flexBtn: { flex: 1 },

  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCardHalf: { flex: 1 },

  quickActions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
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
  sectionLink: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
});
