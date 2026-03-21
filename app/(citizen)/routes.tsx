import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

/**
 * Pantalla de Rutas de Recolección para el Ciudadano.
 *
 * Muestra el mapa de Zipaquirá con la ruta activa y un bottom sheet
 * con la información de la próxima ruta cercana.
 *
 * ⚠️ Para el mapa real: npx expo install react-native-maps
 * y configurar GOOGLE_MAPS_API_KEY en app.json > android.config / ios.config
 */
export default function CitizenRoutesScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Barra de búsqueda flotante sobre el mapa ──────── */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={theme.colors.textMuted} />
        <Text style={styles.searchText}>Buscar dirección en Zipaquirá</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* ── Mapa ──────────────────────────────────────────── */}
      {/*
        Reemplazar este bloque por:
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 5.0336,
            longitude: -74.0065,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker coordinate={{ latitude: 5.04, longitude: -74.01 }}>
            <View style={styles.markerBubble}>
              <Ionicons name="car" size={16} color="#fff" />
            </View>
            <Text style={styles.markerLabel}>Ruta Activa</Text>
          </Marker>
        </MapView>
      */}
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapContent}>
          <Ionicons name="map" size={56} color={theme.colors.primaryMid} />
          <Text style={styles.mapPlaceholderText}>Mapa de Zipaquirá</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            react-native-maps + Google Maps API Key
          </Text>

          {/* Marcador de ruta activa simulado */}
          <View style={styles.mockMarker}>
            <View style={styles.mockMarkerBubble}>
              <Ionicons name="car" size={16} color={theme.colors.textOnPrimary} />
            </View>
            <View style={styles.mockMarkerLabel}>
              <Text style={styles.mockMarkerLabelText}>Ruta Activa</Text>
            </View>
          </View>
        </View>

        {/* Botón de localización */}
        <View style={styles.locateBtn}>
          <Ionicons name="locate" size={22} color={theme.colors.textPrimary} />
        </View>
      </View>

      {/* ── Bottom sheet: próxima ruta ────────────────────── */}
      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.sheetHandle} />

        {/* Cabecera */}
        <View style={styles.routeHeader}>
          <View>
            <Text style={styles.routeTitle}>Siguiente Ruta Cercana</Text>
            <View style={styles.routeTimeRow}>
              <Ionicons
                name="time-outline"
                size={14}
                color={theme.colors.primary}
              />
              <Text style={styles.routeTime}>Hoy, 2:00 PM</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>EN CAMINO</Text>
          </View>
        </View>

        {/* Barrios atendidos */}
        <View style={styles.barriосCard}>
          <View style={styles.barriosIconBg}>
            <Ionicons
              name="location-outline"
              size={18}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.barriosContent}>
            <Text style={styles.barriosLabel}>BARRIOS ATENDIDOS</Text>
            <Text style={styles.barriosText}>
              San Pablo, El Centro, Algarra III
            </Text>
          </View>
        </View>

        {/* Botón de notificación */}
        <CustomButton
          label="Notificarme cuando esté cerca"
          leftIcon={
            <Ionicons
              name="notifications-outline"
              size={18}
              color={theme.colors.textOnPrimary}
            />
          }
          onPress={() =>
            Alert.alert(
              'Notificación activada',
              'Te avisaremos cuando el camión de recolección esté a menos de 10 minutos.',
              [{ text: 'Entendido' }],
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ── Barra de búsqueda ────────────────────────────────────
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    marginHorizontal: theme.spacing.screen,
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    ...theme.shadows.md,
    zIndex: 10,
  },
  searchText: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
  },

  // ── Mapa ─────────────────────────────────────────────────
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#D4EAD0',
    position: 'relative',
  },
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  mapPlaceholderText: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  mapPlaceholderSubtext: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace',
  },
  mockMarker: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  mockMarkerBubble: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockMarkerLabel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginTop: 4,
    ...theme.shadows.sm,
  },
  mockMarkerLabelText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  locateBtn: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },

  // ── Bottom sheet ─────────────────────────────────────────
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.xl,
    paddingTop: theme.spacing.md,
    ...theme.shadows.lg,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  routeTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  routeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  routeTime: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  statusBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  statusBadgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  barriосCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  barriosIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barriosContent: {
    flex: 1,
  },
  barriosLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  barriosText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
});
