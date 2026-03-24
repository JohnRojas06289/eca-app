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

interface RecentActivity {
  id: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  timestamp: string;
  location: string;
}

const RECENT_ACTIVITY: RecentActivity[] = [
  { id: '1', material: 'Plástico PET',       materialType: 'plastic',   kg: 12.5, timestamp: 'Hoy, 10:30 AM',    location: 'Zipaquirá' },
  { id: '2', material: 'Cartón Corrugado',   materialType: 'cardboard', kg: 45.0, timestamp: 'Ayer, 4:15 PM',    location: 'Zipaquirá' },
  { id: '3', material: 'Vidrio Transparente',materialType: 'glass',     kg: 8.2,  timestamp: 'Ayer, 11:20 AM',   location: 'Zipaquirá' },
];

export default function RecyclerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Reciclador';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarFallback}>
                <Text style={styles.headerAvatarInitial}>
                  {firstName[0]?.toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.headerWelcome}>BIENVENIDO</Text>
              <Text style={styles.headerName}>Hola, {firstName}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/(recycler)/alerts')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* ── Tarjeta hero de impacto ───────────────────── */}
        <StatCard
          variant="hero"
          label="IMPACTO TOTAL"
          value="1.250"
          unit="kg"
          trend="Material recolectado"
          trendDirection="neutral"
          style={styles.heroCard}
        />
        {/* Sub-badge dentro del hero */}
        <View style={styles.heroSubBadge}>
          <Ionicons name="leaf-outline" size={14} color={theme.colors.textOnPrimary} />
          <Text style={styles.heroSubBadgeText}>Asociación Zipaquirá</Text>
        </View>

        {/* ── Stats compactos ───────────────────────────── */}
        <View style={styles.statsRow}>
          <StatCard
            variant="compact"
            label="Ingresos Est."
            value="$450.000"
            icon="cash-outline"
            iconColor={theme.colors.primary}
            style={styles.statCardHalf}
          />
          <StatCard
            variant="compact"
            label="Ruta Actual"
            value="Centro Hist..."
            icon="map-outline"
            iconColor={theme.colors.info}
            iconBgColor={theme.colors.infoLight}
            style={styles.statCardHalf}
          />
        </View>

        {/* ── Acciones rápidas ──────────────────────────── */}
        <View style={styles.quickActions}>
          <CustomButton
            label="REVISAR PESAJES"
            leftIcon={
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={() => router.push('/(recycler)/validate')}
            style={styles.actionBtn}
          />
          <CustomButton
            label="VER PRECIOS"
            leftIcon={
              <Ionicons
                name="pricetag-outline"
                size={18}
                color={theme.colors.primary}
              />
            }
            variant="secondary"
            onPress={() => router.push('/(recycler)/prices')}
            style={styles.actionBtn}
          />
        </View>

        {/* ── Actividad reciente ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
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
          />
        ))}

        {/* ── Mini mapa de ruta ─────────────────────────── */}
        <View style={styles.miniMap}>
          {/* Reemplazar con MapView thumbnail de react-native-maps */}
          <View style={styles.miniMapPlaceholder}>
            <Ionicons name="map" size={32} color={theme.colors.primaryMid} />
          </View>
          <View style={styles.miniMapBadge}>
            <View style={styles.miniMapDot} />
            <Text style={styles.miniMapText}>En ruta: Calle 5 con Carrera 10</Text>
          </View>
        </View>
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

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
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
  headerWelcome: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  headerName: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  // ── Hero card ────────────────────────────────────────────
  heroCard: { marginBottom: 0 },
  heroSubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: theme.spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
    // Posicionar sobre la tarjeta verde (margin negativo)
    marginTop: -theme.spacing.xl,
    marginLeft: theme.spacing.xl,
  },
  heroSubBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },

  // ── Stats ────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCardHalf: { flex: 1 },

  // ── Acciones rápidas ─────────────────────────────────────
  quickActions: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  actionBtn: {},

  // ── Actividad reciente ───────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  sectionLink: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Mini mapa ────────────────────────────────────────────
  miniMap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  miniMapPlaceholder: {
    height: 120,
    backgroundColor: '#D4EAD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniMapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  miniMapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
  },
  miniMapText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },

});
