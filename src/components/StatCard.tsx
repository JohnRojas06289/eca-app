import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

type TrendDirection = 'up' | 'down' | 'neutral';
type CardVariant = 'default' | 'hero' | 'compact';

interface StatCardProps {
  /** Etiqueta descriptiva (ej: "TOTAL MENSUAL", "PQRS PENDIENTES") */
  label: string;
  /** Valor principal (ej: "45.2 Ton", "12", "$450.000") */
  value: string;
  /** Unidad opcional que aparece junto al valor (ej: "Ton", "kg") */
  unit?: string;
  /** Texto de tendencia (ej: "+5.2%", "+12% este mes") */
  trend?: string;
  trendDirection?: TrendDirection;
  /** Nombre de ícono Ionicons mostrado en la esquina superior derecha */
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  /**
   * default → Tarjeta blanca estándar con label arriba y valor grande (usado en Admin dashboard compacto)
   * hero    → Tarjeta verde grande (Dashboard Reciclador: Impacto Total)
   * compact → Tarjeta blanca cuadrada compacta para grillas 2×2 (PQRS, Recicladores)
   */
  variant?: CardVariant;
  style?: ViewStyle;
}

/**
 * Tarjeta de estadística / métrica del Design System ZipaRecicla.
 *
 * Uso típico — variant="hero" (tarjeta verde grande):
 *   <StatCard
 *     variant="hero"
 *     label="IMPACTO TOTAL"
 *     value="1.250"
 *     unit="kg"
 *     trend="+12% este mes"
 *     trendDirection="up"
 *   />
 *
 * Uso típico — variant="default" (tarjeta blanca):
 *   <StatCard
 *     label="Total Mensual"
 *     value="45.2 Ton"
 *     trend="+5.2%"
 *     trendDirection="up"
 *     icon="bar-chart-outline"
 *   />
 *
 * Uso típico — variant="compact" (grilla 2×2):
 *   <StatCard variant="compact" label="PQRS PENDIENTES" value="12" icon="alert-circle-outline" iconColor={theme.colors.warning} />
 */
export function StatCard({
  label,
  value,
  unit,
  trend,
  trendDirection = 'neutral',
  icon,
  iconColor = theme.colors.primary,
  iconBgColor = theme.colors.primaryLight,
  variant = 'default',
  style,
}: StatCardProps) {
  const trendColor =
    trendDirection === 'up'
      ? theme.colors.success
      : trendDirection === 'down'
      ? theme.colors.error
      : theme.colors.textMuted;

  const trendIconName: keyof typeof Ionicons.glyphMap =
    trendDirection === 'up'
      ? 'trending-up'
      : trendDirection === 'down'
      ? 'trending-down'
      : 'remove';

  // ── Variante HERO (tarjeta verde grande del Dashboard Reciclador) ──────────
  if (variant === 'hero') {
    return (
      <View style={[styles.heroCard, style]}>
        <Text style={styles.heroLabel}>{label}</Text>
        <View style={styles.heroValueRow}>
          <Text style={styles.heroValue}>{value}</Text>
          {unit != null && <Text style={styles.heroUnit}> {unit}</Text>}
        </View>
        {trend != null && (
          <View style={styles.trendRow}>
            <Ionicons name={trendIconName} size={14} color="rgba(255,255,255,0.85)" />
            <Text style={styles.heroTrendText}>{trend}</Text>
          </View>
        )}
      </View>
    );
  }

  // ── Variante COMPACT (cuadrado 2×2 para dashboards de admin) ─────────────
  if (variant === 'compact') {
    return (
      <View style={[styles.compactCard, style]}>
        {icon != null && (
          <View style={[styles.iconBadge, { backgroundColor: iconBgColor }]}>
            <Ionicons name={icon} size={theme.sizes.iconMd} color={iconColor} />
          </View>
        )}
        <Text style={styles.compactLabel}>{label}</Text>
        <Text style={[styles.compactValue, { color: iconColor }]}>{value}</Text>
        {trend != null && (
          <View style={styles.trendRow}>
            <Ionicons name={trendIconName} size={12} color={trendColor} />
            <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
          </View>
        )}
      </View>
    );
  }

  // ── Variante DEFAULT (tarjeta blanca estándar) ───────────────────────────
  return (
    <View style={[styles.defaultCard, style]}>
      <View style={styles.defaultHeader}>
        <Text style={styles.defaultLabel}>{label}</Text>
        {icon != null && (
          <View style={[styles.iconBadge, { backgroundColor: iconBgColor }]}>
            <Ionicons name={icon} size={theme.sizes.iconMd} color={iconColor} />
          </View>
        )}
      </View>
      <View style={styles.defaultValueRow}>
        <Text style={styles.defaultValue}>{value}</Text>
        {unit != null && <Text style={styles.defaultUnit}> {unit}</Text>}
      </View>
      {trend != null && (
        <View style={styles.trendRow}>
          <Ionicons name={trendIconName} size={13} color={trendColor} />
          <Text style={[styles.trendText, { color: trendColor }]}>{trend}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Hero ──────────────────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    ...theme.shadows.md,
  },
  heroLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: theme.spacing.xs,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  heroValue: {
    fontSize: theme.typography.sizes.hero,
    fontWeight: theme.typography.weights.extrabold,
    color: theme.colors.textOnPrimary,
  },
  heroUnit: {
    fontSize: theme.typography.sizes.h3,
    fontWeight: theme.typography.weights.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  heroTrendText: {
    fontSize: theme.typography.sizes.small,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 4,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Compact ───────────────────────────────────────────────────────────────
  compactCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    flex: 1,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  compactLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  compactValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.extrabold,
  },

  // ── Default ───────────────────────────────────────────────────────────────
  defaultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    width: '100%',
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  defaultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  defaultLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  defaultValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  defaultValue: {
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  defaultUnit: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textSecondary,
  },

  // ── Compartidos ───────────────────────────────────────────────────────────
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.medium,
    marginLeft: 3,
  },
});
