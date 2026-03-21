import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

// ⚠️ Reemplazar con los datos reales de contacto de la ECA
const WHATSAPP_NUMBER = '573000000000';
const PHONE_NUMBER = '+57 300 000 0000';
const EMAIL = 'atencion@eca-zipaquira.gov.co';

interface ContactRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function ContactRow({ icon, title, subtitle, onPress }: ContactRowProps) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.contactIconBg}>
        <Ionicons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <View style={styles.contactText}>
        <Text style={styles.contactTitle}>{title}</Text>
        <Text style={styles.contactSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textMuted}
      />
    </TouchableOpacity>
  );
}

export default function SupportScreen() {
  const router = useRouter();

  function openWhatsApp() {
    Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=Hola, necesito ayuda con ZipaRecicla`);
  }
  function openPhone() {
    Linking.openURL(`tel:${PHONE_NUMBER}`);
  }
  function openEmail() {
    Linking.openURL(`mailto:${EMAIL}?subject=Soporte ZipaRecicla`);
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
        <Text style={styles.headerTitle}>Contacto con Soporte</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Ícono y título ────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.heroIconBg}>
            <Ionicons name="headset" size={32} color={theme.colors.primary} />
          </View>
          <Text style={styles.heroTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.heroSubtitle}>
            Estamos aquí para apoyarte en cada paso de tu reciclaje.
          </Text>
        </View>

        {/* ── Tarjeta WhatsApp (destacada) ──────────────── */}
        <View style={styles.whatsappCard}>
          <View style={styles.whatsappInfo}>
            <View style={styles.whatsappIconBg}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.whatsappText}>
              <Text style={styles.whatsappTitle}>Chat por WhatsApp</Text>
              <Text style={styles.whatsappDescription}>
                Respuesta rápida y directa para tus dudas cotidianas.
              </Text>
            </View>
          </View>
          <CustomButton
            label="Iniciar Chat"
            rightIcon={
              <Ionicons
                name="open-outline"
                size={16}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={openWhatsApp}
            size="md"
          />
        </View>

        {/* ── Otras opciones de contacto ────────────────── */}
        <View style={styles.contactsCard}>
          <ContactRow
            icon="call-outline"
            title="Llamada Directa"
            subtitle="Para asuntos urgentes y emergencias."
            onPress={openPhone}
          />
          <View style={styles.separator} />
          <ContactRow
            icon="mail-outline"
            title="Enviar Correo Electrónico"
            subtitle="Consultas generales y sugerencias."
            onPress={openEmail}
          />
        </View>

        {/* ── Horario de atención ───────────────────────── */}
        <View style={styles.scheduleCard}>
          <View style={styles.scheduleHeader}>
            <Ionicons
              name="time-outline"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.scheduleTitle}>Horario de Atención</Text>
          </View>
          <View style={styles.scheduleGrid}>
            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduleDayLabel}>LUNES A VIERNES</Text>
              <Text style={styles.scheduleTime}>8:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.scheduleBlock}>
              <Text style={styles.scheduleDayLabel}>SÁBADOS</Text>
              <Text style={styles.scheduleTime}>9:00 AM - 1:00 PM</Text>
            </View>
          </View>
        </View>

        {/* ── Botón FAQ ─────────────────────────────────── */}
        <CustomButton
          label="Ver Preguntas Frecuentes"
          leftIcon={
            <Ionicons
              name="help-circle-outline"
              size={18}
              color={theme.colors.primary}
            />
          }
          variant="secondary"
          onPress={() => router.push('/(citizen)/help')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },

  // ── Header ──────────────────────────────────────────────
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

  // ── Hero ─────────────────────────────────────────────────
  heroSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  heroIconBg: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  heroTitle: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
  },

  // ── WhatsApp ─────────────────────────────────────────────
  whatsappCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  whatsappInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  whatsappIconBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whatsappText: { flex: 1 },
  whatsappTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  whatsappDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.small * 1.5,
  },

  // ── Contactos ────────────────────────────────────────────
  contactsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  contactIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: { flex: 1 },
  contactTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.separator,
    marginLeft: theme.spacing.lg + 44 + theme.spacing.md,
  },

  // ── Horario ──────────────────────────────────────────────
  scheduleCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  scheduleTitle: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  scheduleGrid: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  scheduleBlock: { flex: 1 },
  scheduleDayLabel: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: theme.spacing.xs,
  },
  scheduleTime: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
});
