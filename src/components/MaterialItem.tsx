import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';

export type MaterialType =
  | 'plastic'
  | 'cardboard'
  | 'glass'
  | 'metals'
  | 'organic'
  | 'paper'
  | 'rcd'
  | 'waste'
  | 'other';

const MATERIAL_CONFIG: Record<
  MaterialType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }
> = {
  plastic:   { icon: 'water-outline',       color: theme.colors.plastic,   bgColor: theme.colors.plasticBg   },
  cardboard: { icon: 'cube-outline',        color: theme.colors.cardboard,  bgColor: theme.colors.cardboardBg },
  glass:     { icon: 'wine-outline',        color: theme.colors.glass,      bgColor: theme.colors.glassBg     },
  metals:    { icon: 'construct-outline',   color: theme.colors.metals,     bgColor: theme.colors.metalsBg    },
  organic:   { icon: 'leaf-outline',        color: theme.colors.organic,    bgColor: theme.colors.organicBg   },
  paper:     { icon: 'document-text-outline', color: theme.colors.paper,   bgColor: theme.colors.paperBg     },
  rcd:       { icon: 'hammer-outline',      color: theme.colors.rcd,        bgColor: theme.colors.rcdBg       },
  waste:     { icon: 'trash-bin-outline',   color: theme.colors.waste,      bgColor: theme.colors.wasteBg     },
  other:     { icon: 'apps-outline',        color: theme.colors.textSecondary, bgColor: theme.colors.separator },
};

interface MaterialItemProps {
  /** Nombre del material (ej: "PET Cristal", "Cartón Corrugado") */
  name: string;
  /** Subtítulo descriptivo (ej: "Plástico transparente", "Limpio y seco") */
  subtitle?: string;
  /** Valor principal derecho (ej: "$1,200", "45.5 kg", "CONFIRMADO") */
  value: string;
  /** Color del texto del valor (por defecto: primary verde) */
  valueColor?: string;
  /** Badge de estado debajo del valor (ej: "+2.5%", "Estable") */
  badge?: string;
  /** Color del badge (background con 12% opacidad + texto) */
  badgeColor?: string;
  /** Tipo de material para asignar ícono y colores automáticamente */
  materialType?: MaterialType;
  /** Sobrescribe el ícono del tipo de material */
  customIcon?: keyof typeof Ionicons.glyphMap;
  customIconColor?: string;
  customIconBg?: string;
  /** Timestamp opcional (ej: "Hoy, 10:30 AM", "15 Oct, 2:30 PM") */
  timestamp?: string;
  onPress?: () => void;
  /** Muestra un chevron ">" al final derecho */
  showChevron?: boolean;
  style?: ViewStyle;
}

/**
 * Ítem de lista con ícono coloreado + contenido + valor a la derecha.
 *
 * Reutilizado en: Lista de Precios, Historial de Pesajes,
 * Actividad Reciente del Dashboard, Alertas Recientes.
 *
 * Uso típico — Lista de Precios:
 *   <MaterialItem
 *     name="PET Cristal"
 *     subtitle="Plástico transparente"
 *     value="$1,200"
 *     badge="+2.5%"
 *     badgeColor={theme.colors.success}
 *     materialType="plastic"
 *     onPress={() => router.push('/prices/pet')}
 *   />
 *
 * Uso típico — Historial de Pesajes:
 *   <MaterialItem
 *     name="Plástico PET"
 *     timestamp="15 Oct, 2:30 PM"
 *     value="45.5 kg"
 *     badge="CONFIRMADO"
 *     badgeColor={theme.colors.success}
 *     materialType="plastic"
 *   />
 */
export function MaterialItem({
  name,
  subtitle,
  value,
  valueColor = theme.colors.primary,
  badge,
  badgeColor = theme.colors.success,
  materialType = 'other',
  customIcon,
  customIconColor,
  customIconBg,
  timestamp,
  onPress,
  showChevron = false,
  style,
}: MaterialItemProps) {
  const matConfig = MATERIAL_CONFIG[materialType];
  const iconName = customIcon ?? matConfig.icon;
  const iconColor = customIconColor ?? matConfig.color;
  const iconBg = customIconBg ?? matConfig.bgColor;

  const Wrapper = onPress != null ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      {/* Ícono izquierdo */}
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={theme.sizes.iconLg} color={iconColor} />
      </View>

      {/* Contenido central */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {subtitle != null && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
        {timestamp != null && (
          <Text style={styles.timestamp}>{timestamp}</Text>
        )}
      </View>

      {/* Valor derecho + badge */}
      <View style={styles.right}>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
        {badge != null && (
          <View style={[styles.badge, { backgroundColor: badgeColor + '1F' }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>
              {badge}
            </Text>
          </View>
        )}
        {showChevron && (
          <Ionicons
            name="chevron-forward"
            size={theme.sizes.iconSm}
            color={theme.colors.textMuted}
            style={styles.chevron}
          />
        )}
      </View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
  },
  badge: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  badgeText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
  },
  chevron: {
    marginTop: 4,
  },
});
