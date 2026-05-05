import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { MaterialItem } from '@/src/components/MaterialItem';
import { useAuth } from '@/src/hooks/useAuth';
import type { MaterialType } from '@/src/components/MaterialItem';
import { formatLongDate, formatShortDateTime } from '@/src/utils/date';

interface WeighingItem {
  id: string;
  material: string;
  materialType: MaterialType;
  kg: number;
  timestamp: string;
  status: 'confirmed' | 'pending';
}

interface ObservationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success';
}

interface CommentItem {
  id: string;
  author: string;
  body: string;
  timestamp: string;
}

const now = new Date();

const SAMPLE_WEIGHINGS: WeighingItem[] = [
  { id: '1', material: 'Plástico PET', materialType: 'plastic', kg: 12.5, timestamp: formatShortDateTime(new Date(now.getTime() - 50 * 60 * 1000)), status: 'confirmed' },
  { id: '2', material: 'Cartón corrugado', materialType: 'cardboard', kg: 45, timestamp: formatShortDateTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)), status: 'confirmed' },
  { id: '3', material: 'Vidrio transparente', materialType: 'glass', kg: 8.2, timestamp: formatShortDateTime(new Date(now.getTime() - 18 * 60 * 60 * 1000)), status: 'pending' },
];

const SAMPLE_OBSERVATIONS: ObservationItem[] = [
  { id: '1', title: 'Ruta modificada', body: 'La parada en Calle 5 fue reubicada al parque central.', timestamp: formatShortDateTime(new Date(now.getTime() - 30 * 60 * 1000)), type: 'warning' },
  { id: '2', title: 'Jornada completada', body: 'Registro del día anterior confirmado por la ECA.', timestamp: formatShortDateTime(new Date(now.getTime() - 24 * 60 * 60 * 1000)), type: 'success' },
];

const SAMPLE_COMMENTS: CommentItem[] = [
  { id: '1', author: 'Administrador', body: 'Recuerda llevar los materiales segregados correctamente.', timestamp: formatShortDateTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)) },
  { id: '2', author: 'Supervisora Ana', body: 'Buen trabajo hoy, los pesajes están al día.', timestamp: formatShortDateTime(new Date(now.getTime() - 5 * 60 * 60 * 1000)) },
];

const OBS_ICON: Record<ObservationItem['type'], { name: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  info: { name: 'information-circle-outline', color: theme.colors.info, bg: theme.colors.infoLight },
  warning: { name: 'warning-outline', color: theme.colors.warning, bg: theme.colors.warningLight },
  success: { name: 'checkmark-circle-outline', color: theme.colors.success, bg: theme.colors.successLight },
};

export default function RecyclerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const firstName = user?.name?.split(' ')[0] ?? 'Reciclador';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
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

        {/* Money */}
        <View style={styles.moneyCard}>
          <View style={styles.moneyIconWrap}>
            <Ionicons name="cash-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.moneyInfo}>
            <Text style={styles.moneyLabel}>Ingresos estimados</Text>
            <Text style={styles.moneyValue}>$450.000</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(recycler)/weighings')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-forward" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Pesajes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pesajes</Text>
          <TouchableOpacity onPress={() => router.push('/(recycler)/weighings')}>
            <Text style={styles.sectionLink}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {SAMPLE_WEIGHINGS.map((item) => (
          <MaterialItem
            key={item.id}
            name={item.material}
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

        {/* Observations */}
        <View style={[styles.sectionHeader, { marginTop: theme.spacing.xl }]}>
          <Text style={styles.sectionTitle}>Observaciones</Text>
        </View>

        {SAMPLE_OBSERVATIONS.map((obs) => {
          const cfg = OBS_ICON[obs.type];
          return (
            <View key={obs.id} style={styles.obsCard}>
              <View style={[styles.obsIconWrap, { backgroundColor: cfg.bg }]}>
                <Ionicons name={cfg.name} size={18} color={cfg.color} />
              </View>
              <View style={styles.obsContent}>
                <Text style={styles.obsTitle}>{obs.title}</Text>
                <Text style={styles.obsBody}>{obs.body}</Text>
                <Text style={styles.obsTime}>{obs.timestamp}</Text>
              </View>
            </View>
          );
        })}

        {/* Comments */}
        <View style={[styles.sectionHeader, { marginTop: theme.spacing.xl }]}>
          <Text style={styles.sectionTitle}>Comentarios</Text>
        </View>

        {SAMPLE_COMMENTS.map((c) => (
          <View key={c.id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{c.author}</Text>
              <Text style={styles.commentTime}>{c.timestamp}</Text>
            </View>
            <Text style={styles.commentBody}>{c.body}</Text>
          </View>
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

  moneyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  moneyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyInfo: { flex: 1 },
  moneyLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
  moneyValue: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginTop: 2,
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

  obsCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  obsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  obsContent: { flex: 1 },
  obsTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  obsBody: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  obsTime: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },

  commentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  commentAuthor: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  commentTime: {
    fontSize: theme.typography.sizes.tiny,
    color: theme.colors.textMuted,
  },
  commentBody: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
