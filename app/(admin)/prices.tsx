import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { formatDateTime } from '@/src/utils/date';

interface MaterialPrice {
  id: string;
  name: string;
  pricePerKg: number;
  icon: string;
  color: string;
  bgColor: string;
}

const INITIAL_PRICES: MaterialPrice[] = [
  { id: '1', name: 'Plástico PET',    pricePerKg: 800,  icon: 'water-outline',         color: theme.colors.plastic,   bgColor: theme.colors.plasticBg },
  { id: '2', name: 'Plástico PEAD',   pricePerKg: 600,  icon: 'water-outline',         color: theme.colors.plastic,   bgColor: theme.colors.plasticBg },
  { id: '3', name: 'Cartón Corrugado',pricePerKg: 350,  icon: 'albums-outline',        color: theme.colors.cardboard, bgColor: theme.colors.cardboardBg },
  { id: '4', name: 'Vidrio',          pricePerKg: 120,  icon: 'wine-outline',          color: theme.colors.glass,     bgColor: theme.colors.glassBg },
  { id: '5', name: 'Aluminio',        pricePerKg: 2200, icon: 'hardware-chip-outline', color: theme.colors.metals,    bgColor: theme.colors.metalsBg },
  { id: '6', name: 'Papel Archivo',   pricePerKg: 500,  icon: 'document-outline',      color: theme.colors.paper,     bgColor: theme.colors.paperBg },
];

export default function AdminPricesScreen() {
  const router = useRouter();
  const [items, setItems] = useState(INITIAL_PRICES);
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(INITIAL_PRICES.map((m) => [m.id, String(m.pricePerKg)])),
  );
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const hasChanges = useMemo(
    () => items.some((m) => Number(drafts[m.id] ?? m.pricePerKg) !== m.pricePerKg),
    [items, drafts],
  );

  function savePrices() {
    const next = items.map((m) => {
      const parsed = Number((drafts[m.id] ?? '').replace(',', '.'));
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Precio inválido para ${m.name}`);
      }
      return { ...m, pricePerKg: Math.round(parsed) };
    });

    setItems(next);
    setUpdatedAt(new Date());
    Alert.alert('Listo', 'Precios actualizados correctamente.');
  }

  function onPressSave() {
    try {
      savePrices();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Revisa los precios ingresados.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Actualizar precios</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.banner}>
        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.bannerText}>Última actualización: {formatDateTime(updatedAt)}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={[styles.iconBg, { backgroundColor: item.bgColor }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.sub}>Valor por kilogramo</Text>
            </View>
            <View style={styles.priceInputWrap}>
              <Text style={styles.prefix}>$</Text>
              <TextInput
                style={styles.priceInput}
                keyboardType="numeric"
                value={drafts[item.id]}
                onChangeText={(v) => setDrafts((prev) => ({ ...prev, [item.id]: v.replace(/[^\d]/g, '') }))}
                placeholder="0"
                placeholderTextColor={theme.colors.textMuted}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, !hasChanges && styles.saveBtnDisabled]}
          onPress={onPressSave}
          disabled={!hasChanges}
          activeOpacity={0.85}
        >
          <Ionicons name="save-outline" size={18} color={theme.colors.textOnPrimary} />
          <Text style={styles.saveText}>Guardar precios</Text>
        </TouchableOpacity>
      </View>
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
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.md,
  },
  bannerText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: 110,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  sub: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
  priceInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 110,
    height: 42,
  },
  prefix: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: theme.spacing.screen,
  },
  saveBtn: {
    height: theme.sizes.buttonHeight,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: theme.spacing.xs,
    ...theme.shadows.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textOnPrimary,
  },
});
