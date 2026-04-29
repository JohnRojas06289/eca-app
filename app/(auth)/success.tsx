import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { useAuth } from '@/src/hooks/useAuth';
import { USE_DEMO_AUTH } from '@/src/config/env';

/**
 * Pantalla de éxito. Maneja dos variantes via search params:
 *
 *   type="account"  → "¡Cuenta creada con éxito!" (tras registro)
 *                     Fondo blanco, header con X, card de próximo paso
 *
 *   type="password" → "¡Contraseña Actualizada!" (tras resetear contraseña)
 *                     Fondo gris, tarjeta centrada modal-like, botón volver al login
 */
export default function SuccessScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { type } = useLocalSearchParams<{ type: 'account' | 'password' }>();

  const isPasswordReset = type === 'password';
  const isDemoRegisterFlow = USE_DEMO_AUTH;

  async function handleGoToDashboard() {
    if (!isDemoRegisterFlow) {
      router.replace('/(auth)');
      return;
    }

    // Modo demo: entramos como ciudadano por defecto tras el registro.
    await signIn({
      id: 'nuevo-usuario',
      name: 'Nuevo Usuario',
      role: 'citizen',
      token: 'demo-token',
    });
    // El guard en _layout.tsx redirige automáticamente a /(citizen)
  }

  function handleGoToLogin() {
    router.replace('/(auth)');
  }

  // ── Variante CONTRASEÑA ACTUALIZADA ──────────────────────────────────────
  if (isPasswordReset) {
    return (
      <SafeAreaView style={styles.safeGray}>
        <StatusBar style="dark" />
        <View style={styles.modalCenter}>
          <View style={styles.modalCard}>
            {/* Ícono */}
            <View style={styles.passwordHalo}>
              <View style={styles.passwordCircle}>
                <Ionicons
                  name="checkmark"
                  size={36}
                  color={theme.colors.textOnPrimary}
                />
              </View>
            </View>

            <Text style={styles.passwordTitle}>¡Contraseña{'\n'}Actualizada!</Text>
            <Text style={styles.passwordDescription}>
              Tu contraseña ha sido restablecida exitosamente. Ahora puedes
              ingresar con tus nuevas credenciales.
            </Text>

            <CustomButton
              label="Volver al Inicio de Sesión"
              onPress={handleGoToLogin}
              style={styles.passwordBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ── Variante CUENTA CREADA ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeWhite}>
      <StatusBar style="dark" />

      {/* ── Header con título y botón cerrar ──────────────── */}
      <View style={styles.accountHeader}>
        <Text style={styles.accountHeaderTitle}>Registro Completo</Text>
        <TouchableOpacity
          onPress={handleGoToLogin}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Contenido ─────────────────────────────────────── */}
      <View style={styles.accountContent}>
        {/* Card verde con ícono de éxito */}
        <View style={styles.accountIconCard}>
          <View style={styles.accountCircle}>
            <Ionicons
              name="checkmark"
              size={40}
              color={theme.colors.textOnPrimary}
            />
          </View>
        </View>

        <Text style={styles.accountTitle}>¡Cuenta creada con éxito!</Text>
        <Text style={styles.accountDescription}>
          Bienvenido a ZipaRecicla! Ahora eres parte de la comunidad de
          reciclaje de Zipaquirá. Juntos haremos de nuestra ciudad un lugar
          más limpio y sostenible.
        </Text>

        {/* Card de próximo paso */}
        <View style={styles.nextStepCard}>
          <View style={styles.nextStepIconBadge}>
            <Ionicons
              name="leaf-outline"
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.nextStepText}>
            <Text style={styles.nextStepLabel}>Próximo paso</Text>
            <Text style={styles.nextStepDescription}>
              Configura tus horarios de recolección
            </Text>
          </View>
        </View>
      </View>

      {/* ── Footer ────────────────────────────────────────── */}
      <View style={styles.accountFooter}>
        <CustomButton
          label={isDemoRegisterFlow ? 'Ir al Dashboard' : 'Ir al inicio de sesión'}
          rightIcon={
            <Ionicons
              name="arrow-forward"
              size={18}
              color={theme.colors.textOnPrimary}
            />
          }
          onPress={handleGoToDashboard}
          style={styles.dashboardBtn}
        />
        {isDemoRegisterFlow && (
          <TouchableOpacity
            onPress={handleGoToDashboard}
            style={styles.guideBtn}
          >
            <Text style={styles.guideText}>Explorar sin configurar</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ── Shared ───────────────────────────────────────────────
  safeGray: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeWhite: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },

  // ── Password reset variant ───────────────────────────────
  modalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xxl,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    width: '100%',
    ...theme.shadows.lg,
  },
  passwordHalo: {
    width: 100,
    height: 100,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xxl,
  },
  passwordCircle: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordTitle: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  passwordDescription: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.xxl,
  },
  passwordBtn: {
    width: '100%',
  },

  // ── Account created variant ──────────────────────────────
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    position: 'relative',
  },
  accountHeaderTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    right: theme.spacing.screen,
    top: theme.spacing.lg,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.screen,
    alignItems: 'center',
  },
  accountIconCard: {
    width: '100%',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxxl,
    marginBottom: theme.spacing.xxl,
  },
  accountCircle: {
    width: 80,
    height: 80,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountTitle: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  accountDescription: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.xxl,
  },

  nextStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    width: '100%',
    gap: theme.spacing.md,
  },
  nextStepIconBadge: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepText: {
    flex: 1,
  },
  nextStepLabel: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  nextStepDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  accountFooter: {
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  dashboardBtn: {
    marginBottom: theme.spacing.xs,
  },
  guideBtn: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  guideText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
});
