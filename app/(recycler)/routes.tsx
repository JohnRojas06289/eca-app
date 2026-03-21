import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

type StopStatus = 'PENDIENTE' | 'REPORTADO' | 'COMPLETADO';

interface RouteStop {
  id: string;
  number: number;
  name: string;
  address: string;
  status: StopStatus;
  note?: string;
}

const ROUTE_STOPS: RouteStop[] = [
  { id: '1', number: 14, name: 'Edificio Plaza Real',  address: 'Carrera 7 # 3-45, Centro',      status: 'PENDIENTE'  },
  { id: '2', number: 15, name: 'Conjunto El Salitre',  address: 'Calle 1 # 12-10, Villa Maria',  status: 'REPORTADO',  note: 'Acceso bloqueado por obras' },
  { id: '3', number: 16, name: 'Parque Villaveces',    address: 'Carrera 6 # 1-20',               status: 'COMPLETADO' },
];

const STATUS_CONFIG: Record<StopStatus, { color: string; bgColor: string; label: string }> = {
  PENDIENTE:  { color: theme.colors.warning,   bgColor: theme.colors.warningLight,   label: 'PENDIENTE'  },
  REPORTADO:  { color: theme.colors.error,     bgColor: theme.colors.errorLight,     label: 'REPORTADO'  },
  COMPLETADO: { color: theme.colors.textMuted, bgColor: theme.colors.separator,      label: 'COMPLETADO' },
};

const PROGRESS_PERCENT = 65;
const TOTAL_STOPS = 20;
const VISITED_STOPS = 13;

export default function RecyclerRoutesScreen() {
  const router = useRouter();
  const [finalizingRoute, setFinalizingRoute] = useState(false);

  async function handleFinalizeRoute() {
    setFinalizingRoute(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await RouteApi.finalize({ routeId: currentRouteId });
      await new Promise((r) => setTimeout(r, 800));
      router.back();
    } finally {
      setFinalizingRoute(false);
    }
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
        <Text style={styles.headerTitle}>Gestión de Rutas</Text>
        <Ionicons name="car-outline" size={24} color={theme.colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Mini mapa ─────────────────────────────────── */}
        <View style={styles.mapContainer}>
          {/* Reemplazar con MapView de react-native-maps */}
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map" size={40} color={theme.colors.primaryMid} />
          </View>
          <View style={styles.mapBadge}>
            <View style={styles.mapDot} />
            <Text style={styles.mapBadgeText}>En camino: Calle 4 con Carrera 10</Text>
          </View>
          <View style={styles.locateBtn}>
            <Ionicons name="locate" size={20} color={theme.colors.textPrimary} />
          </View>
        </View>

        {/* ── Ruta en curso ─────────────────────────────── */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardHeader}>
            <View>
              <Text style={styles.routeCardTag}>EN CURSO</Text>
              <Text style={styles.routeCardName}>Centro Histórico</Text>
            </View>
            <Ionicons name="swap-vertical-outline" size={28} color={theme.colors.primary} />
          </View>

          {/* Barra de progreso */}
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progreso de recolección</Text>
            <Text style={styles.progressPercent}>{PROGRESS_PERCENT}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${PROGRESS_PERCENT}%` }]} />
          </View>

          {/* Estadísticas */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>VISITADOS</Text>
              <Text style={styles.statValue}>{VISITED_STOPS} / {TOTAL_STOPS}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>TIEMPO EST.</Text>
              <Text style={styles.statValue}>45 min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>CARGA ACTUAL</Text>
              <Text style={styles.statValue}>1.2 Ton</Text>
            </View>
          </View>
        </View>

        {/* ── Próximas paradas ──────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Ionicons name="list-outline" size={18} color={theme.colors.textPrimary} />
          <Text style={styles.sectionTitle}>Próximas Paradas</Text>
        </View>

        {ROUTE_STOPS.map((stop) => {
          const config = STATUS_CONFIG[stop.status];
          const isCompleted = stop.status === 'COMPLETADO';
          const isReported = stop.status === 'REPORTADO';

          return (
            <View
              key={stop.id}
              style={[
                styles.stopCard,
                isReported && styles.stopCardReported,
                isCompleted && styles.stopCardCompleted,
              ]}
            >
              {/* Número de parada */}
              <View
                style={[
                  styles.stopNumber,
                  isCompleted && styles.stopNumberCompleted,
                  isReported && styles.stopNumberReported,
                ]}
              >
                {isCompleted ? (
                  <Ionicons name="checkmark" size={16} color={theme.colors.textOnPrimary} />
                ) : (
                  <Text style={styles.stopNumberText}>{stop.number}</Text>
                )}
              </View>

              {/* Info de la parada */}
              <View style={styles.stopInfo}>
                <View style={styles.stopNameRow}>
                  <Text
                    style={[
                      styles.stopName,
                      isCompleted && styles.stopNameCompleted,
                    ]}
                    numberOfLines={1}
                  >
                    {stop.name}
                  </Text>
                  <View style={[styles.stopBadge, { backgroundColor: config.bgColor }]}>
                    <Text style={[styles.stopBadgeText, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.stopAddress,
                    isCompleted && styles.stopAddressCompleted,
                  ]}
                  numberOfLines={1}
                >
                  {stop.address}
                </Text>
                {stop.note && (
                  <View style={styles.stopNoteRow}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={13}
                      color={theme.colors.error}
                    />
                    <Text style={styles.stopNote}>{stop.note}</Text>
                  </View>
                )}

                {/* Acciones de la parada */}
                {!isCompleted && (
                  <View style={styles.stopActions}>
                    {stop.status === 'PENDIENTE' && (
                      <CustomButton
                        label="Navegar"
                        leftIcon={
                          <Ionicons
                            name="navigate-outline"
                            size={14}
                            color={theme.colors.textOnPrimary}
                          />
                        }
                        size="sm"
                        onPress={() => {}}
                        fullWidth={false}
                        style={styles.navigateBtn}
                      />
                    )}
                    {!isReported && (
                      <TouchableOpacity
                        onPress={() => router.push('/(recycler)/report-incident')}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons
                          name="warning-outline"
                          size={22}
                          color={theme.colors.warning}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* ── Finalizar ruta ────────────────────────────── */}
        <CustomButton
          label="Finalizar Ruta"
          leftIcon={
            <Ionicons
              name="checkmark-done-outline"
              size={20}
              color={theme.colors.textOnPrimary}
            />
          }
          onPress={handleFinalizeRoute}
          loading={finalizingRoute}
          style={styles.finalizeBtn}
        />
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

  // ── Mini mapa ────────────────────────────────────────────
  mapContainer: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    position: 'relative',
    ...theme.shadows.sm,
  },
  mapPlaceholder: {
    height: 160,
    backgroundColor: '#D4EAD0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  mapDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  mapBadgeText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  locateBtn: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.sm,
  },

  // ── Tarjeta ruta en curso ────────────────────────────────
  routeCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.sm,
  },
  routeCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  routeCardTag: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.6,
    marginBottom: theme.spacing.xs,
  },
  routeCardName: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  progressPercent: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 4,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 36, backgroundColor: theme.colors.border },
  statLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  // ── Sección paradas ──────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  // ── Paradas ──────────────────────────────────────────────
  stopCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  stopCardReported: { borderLeftWidth: 3, borderLeftColor: theme.colors.error },
  stopCardCompleted: { opacity: 0.65 },
  stopNumber: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stopNumberCompleted: { backgroundColor: theme.colors.textMuted },
  stopNumberReported: { backgroundColor: theme.colors.errorLight },
  stopNumberText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  stopInfo: { flex: 1 },
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  stopName: {
    flex: 1,
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  stopNameCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textMuted,
  },
  stopBadge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    flexShrink: 0,
  },
  stopBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.3,
  },
  stopAddress: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  stopAddressCompleted: { textDecorationLine: 'line-through' },
  stopNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  stopNote: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
  },
  stopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  navigateBtn: { paddingHorizontal: theme.spacing.xl },

  finalizeBtn: { marginTop: theme.spacing.md },
});
