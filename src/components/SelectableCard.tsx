import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

type CardLayout = 'grid' | 'list';

interface SelectableCardProps {
  /** Etiqueta principal de la tarjeta */
  label: string;
  /** Subtítulo descriptivo (solo visible en layout="list") */
  subtitle?: string;
  /** Ícono Ionicons centrado */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Color del ícono cuando NO está seleccionada */
  iconColor?: string;
  /** Estado de selección */
  selected?: boolean;
  onPress: () => void;
  /**
   * grid → Cuadrado/aspecto 1:1 para grillas 2×2 (selección de material, tipo de incidencia)
   * list → Fila horizontal con radio button a la derecha (selección de rol, tipo de residuo)
   */
  layout?: CardLayout;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Tarjeta seleccionable del Design System ZipaRecicla.
 * Aplica borde verde y fondo tintado cuando `selected=true`.
 *
 * Uso típico — grilla de materiales (Nuevo Registro de Pesaje):
 *   <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
 *     {materials.map((m) => (
 *       <SelectableCard
 *         key={m.id}
 *         label={m.name}
 *         icon={m.icon}
 *         selected={selected === m.id}
 *         onPress={() => setSelected(m.id)}
 *         style={{ width: '47%' }}
 *       />
 *     ))}
 *   </View>
 *
 * Uso típico — selección de rol (Registro de Usuario):
 *   <SelectableCard
 *     layout="list"
 *     label="Reciclador"
 *     subtitle="Gestión de residuos recolectados"
 *     icon="leaf-outline"
 *     selected={role === 'recycler'}
 *     onPress={() => setRole('recycler')}
 *   />
 *
 * Uso típico — tipo de incidencia (Reportar Incidencia):
 *   <SelectableCard
 *     label="Acceso Bloqueado"
 *     icon="lock-closed-outline"
 *     selected={type === 'blocked'}
 *     onPress={() => setType('blocked')}
 *     style={{ width: '47%' }}
 *   />
 */
export function SelectableCard({
  label,
  subtitle,
  icon,
  iconColor = theme.colors.textSecondary,
  selected = false,
  onPress,
  layout = 'grid',
  disabled = false,
  style,
}: SelectableCardProps) {
  const activeIconColor = selected ? theme.colors.primary : iconColor;
  const activeIconBg = selected ? theme.colors.primaryLight : theme.colors.separator;

  // ── Layout GRID (cuadrado, grilla 2×2) ─────────────────────────────────
  if (layout === 'grid') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.gridCard,
          selected && styles.cardSelected,
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon != null && (
          <View style={[styles.gridIconContainer, { backgroundColor: activeIconBg }]}>
            <Ionicons name={icon} size={theme.sizes.iconLg} color={activeIconColor} />
          </View>
        )}
        <Text style={[styles.gridLabel, selected && styles.labelSelected]}>
          {label}
        </Text>

        {/* Check badge en esquina superior derecha cuando está seleccionada */}
        {selected && (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark" size={10} color={theme.colors.textOnPrimary} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ── Layout LIST (fila con radio button) ─────────────────────────────────
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.listCard,
        selected && styles.cardSelected,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon != null && (
        <View style={[styles.listIconContainer, { backgroundColor: activeIconBg }]}>
          <Ionicons name={icon} size={theme.sizes.iconMd} color={activeIconColor} />
        </View>
      )}

      <View style={styles.listTextContainer}>
        <Text style={[styles.listLabel, selected && styles.labelSelected]}>
          {label}
        </Text>
        {subtitle != null && (
          <Text style={styles.listSubtitle}>{subtitle}</Text>
        )}
      </View>

      {/* Radio button */}
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── Compartidos ───────────────────────────────────────────────────────────
  cardSelected: {
    borderColor: theme.colors.primary,
  },
  labelSelected: {
    color: theme.colors.primary,
  },
  disabled: {
    opacity: 0.45,
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  gridCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    aspectRatio: 1,
  },
  gridIconContainer: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  gridLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    width: '100%',
  },
  listIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  listTextContainer: {
    flex: 1,
  },
  listLabel: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  listSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.md,
  },
  radioOuterSelected: {
    borderColor: theme.colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
});
