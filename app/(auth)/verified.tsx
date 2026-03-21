import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

/**
 * Pantalla "Identidad Verificada" — aparece después de confirmar el OTP
 * en el flujo de registro. Confirma visualmente que la verificación fue exitosa
 * antes de continuar al paso de creación de cuenta.
 */
export default function VerifiedScreen() {
  const router = useRouter();

  function handleContinue() {
    router.push({
      pathname: '/(auth)/success',
      params: { type: 'account' },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Título de pantalla ────────────────────────────── */}
      <Text style={styles.screenTitle}>Verificación</Text>

      {/* ── Contenido centrado ────────────────────────────── */}
      <View style={styles.content}>
        {/* Ícono con halo de luz */}
        <View style={styles.halo}>
          <View style={styles.circle}>
            <Ionicons name="checkmark" size={48} color={theme.colors.textOnPrimary} />
          </View>
        </View>

        <Text style={styles.title}>Identidad Verificada</Text>
        <Text style={styles.description}>
          Tu cuenta ha sido validada correctamente. Ahora puedes continuar con
          el registro de tu perfil.
        </Text>
      </View>

      {/* ── Acción ───────────────────────────────────────── */}
      <View style={styles.footer}>
        <CustomButton label="Continuar" onPress={handleContinue} />
      </View>

      {/* ── Watermark ────────────────────────────────────── */}
      <View style={styles.watermark}>
        <Ionicons
          name="sync-circle-outline"
          size={16}
          color={theme.colors.primaryMid}
        />
        <Text style={styles.watermarkText}>ZIPARECICLA</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // ── Título superior ──────────────────────────────────────
  screenTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },

  // ── Contenido principal centrado ─────────────────────────
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxxl,
  },

  // Halo exterior (círculo grande difuminado en verde claro)
  halo: {
    width: 140,
    height: 140,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  // Círculo interior sólido verde
  circle: {
    width: 96,
    height: 96,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.xl,
  },

  // ── Watermark ────────────────────────────────────────────
  watermark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  watermarkText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primaryMid,
    letterSpacing: 2,
  },
});
