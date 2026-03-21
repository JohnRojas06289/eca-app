import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { useState } from 'react';

interface SectorSchedule {
  sector: string;
  days: string;
  time: string;
  wasteType: string;
  wasteIcon: string;
  wasteColor: string;
}

const SCHEDULES: SectorSchedule[] = [
  { sector: 'Centro Histórico', days: 'Lunes, Miércoles y Viernes', time: '6:30 AM – 12:00 PM', wasteType: 'Aprovechables',     wasteIcon: 'sync-circle-outline', wasteColor: theme.colors.primary   },
  { sector: 'San Pablo',        days: 'Martes y Jueves',            time: '7:00 AM – 11:30 AM', wasteType: 'Aprovechables',     wasteIcon: 'sync-circle-outline', wasteColor: theme.colors.primary   },
  { sector: 'El Jardín',        days: 'Lunes, Miércoles y Viernes', time: '8:00 AM – 2:00 PM',  wasteType: 'Orgánicos',         wasteIcon: 'leaf-outline',        wasteColor: theme.colors.organic   },
  { sector: 'La Granja',        days: 'Martes y Sábado',            time: '7:30 AM – 1:00 PM',  wasteType: 'Aprovechables',     wasteIcon: 'sync-circle-outline', wasteColor: theme.colors.primary   },
  { sector: 'Algarra III',      days: 'Miércoles y Sábado',         time: '9:00 AM – 3:00 PM',  wasteType: 'No Aprovechables',  wasteIcon: 'trash-outline',       wasteColor: theme.colors.textMuted },
  { sector: 'Villa del Prado',  days: 'Lunes y Jueves',             time: '8:30 AM – 1:30 PM',  wasteType: 'Aprovechables',     wasteIcon: 'sync-circle-outline', wasteColor: theme.colors.primary   },
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const schedule = SCHEDULES.find((s) => s.sector === selected) ?? null;

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
        <Text style={styles.headerTitle}>Horarios de Recolección</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner informativo ────────────────────────────── */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={16} color={theme.colors.info} />
          <Text style={styles.infoBannerText}>
            Selecciona tu sector para ver cuándo pasa el camión por tu zona.
          </Text>
        </View>

        {/* ── Selector de sector ────────────────────────────── */}
        <Text style={styles.sectionLabel}>Elige tu sector</Text>
        {SCHEDULES.map((s) => {
          const isActive = selected === s.sector;
          return (
            <TouchableOpacity
              key={s.sector}
              style={[styles.sectorCard, isActive && styles.sectorCardActive]}
              onPress={() => setSelected(isActive ? null : s.sector)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="location-outline"
                size={20}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
              />
              <Text style={[styles.sectorName, isActive && styles.sectorNameActive]}>
                {s.sector}
              </Text>
              <Ionicons
                name={isActive ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={isActive ? theme.colors.primary : theme.colors.textMuted}
              />
            </TouchableOpacity>
          );
        })}

        {/* ── Detalle del horario ───────────────────────────── */}
        {schedule && (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{schedule.sector}</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBg}>
                <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Días de recolección</Text>
                <Text style={styles.detailValue}>{schedule.days}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconBg}>
                <Ionicons name="time-outline" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Franja horaria</Text>
                <Text style={styles.detailValue}>{schedule.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={[styles.detailIconBg, { backgroundColor: theme.colors.primaryLight }]}>
                <Ionicons name={schedule.wasteIcon as any} size={18} color={schedule.wasteColor} />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Tipo de residuo</Text>
                <Text style={styles.detailValue}>{schedule.wasteType}</Text>
              </View>
            </View>

            <View style={styles.tipBox}>
              <Ionicons name="bulb-outline" size={14} color={theme.colors.warning} />
              <Text style={styles.tipText}>
                Saca tus residuos 15 minutos antes del inicio de la franja horaria.
              </Text>
            </View>
          </View>
        )}
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

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.infoLight,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  infoBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.info,
    lineHeight: theme.typography.sizes.small * theme.typography.lineHeights.normal,
  },

  sectionLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },

  sectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  sectorCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  sectorName: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  sectorNameActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },

  detailCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  detailTitle: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  detailIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailInfo: { flex: 1 },
  detailLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },

  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.warningLight,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.warning,
    lineHeight: theme.typography.sizes.small * theme.typography.lineHeights.normal,
  },
});
