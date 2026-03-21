import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { CustomInput } from '@/src/components/CustomInput';
import { useAuth } from '@/src/hooks/useAuth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [cedulaError, setCedulaError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    let valid = true;

    if (!cedula.trim()) {
      setCedulaError('Ingrese su número de identificación');
      valid = false;
    } else if (cedula.trim().length < 6) {
      setCedulaError('La cédula debe tener al menos 6 dígitos');
      valid = false;
    } else {
      setCedulaError('');
    }

    if (!password.trim()) {
      setPasswordError('Ingrese su contraseña');
      valid = false;
    } else if (password.trim().length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setLoginError('');
    try {
      // ⚠️ Reemplazar con la llamada real a tu API de autenticación:
      // const response = await AuthApi.login({ cedula, password });
      // await signIn(response.user);
      //
      // Demo — detecta rol por prefijo de cédula:
      //   9xxxxxxx → admin
      //   8xxxxxxx → recycler
      //   cualquier otro → citizen
      await new Promise((r) => setTimeout(r, 600));
      const role =
        cedula.startsWith('9') ? 'admin' :
        cedula.startsWith('8') ? 'recycler' :
        'citizen';
      const names: Record<string, string> = {
        admin:    'Carlos Administrador',
        recycler: 'Juan Reciclador',
        citizen:  'María Ciudadana',
      };
      await signIn({
        id: cedula,
        name: names[role],
        role,
        token: 'demo-token',
        cedula,
      });
    } catch {
      setLoginError('Credenciales incorrectas. Verifica tu ID y contraseña.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo y título ──────────────────────────────── */}
          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="sync-circle" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>
              Bienvenido a{' '}
              <Text style={styles.titleGreen}>ZipaRecicla</Text>
            </Text>
            <Text style={styles.subtitle}>
              Gestiona tus residuos de forma inteligente
            </Text>
          </View>

          {/* ── Formulario de login ────────────────────────── */}
          <View style={styles.formCard}>
            <CustomInput
              label="Número de Identificación"
              leftIcon="id-card-outline"
              placeholder="Ingrese su ID"
              value={cedula}
              onChangeText={setCedula}
              keyboardType="numeric"
              error={cedulaError}
              containerStyle={styles.inputSpacing}
            />

            {/* Label de contraseña con link "¿Olvidó?" en la misma fila */}
            <View style={styles.passwordLabelRow}>
              <Text style={styles.passwordLabel}>Contraseña</Text>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/forgot-password')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.forgotLink}>¿Olvidó su contraseña?</Text>
              </TouchableOpacity>
            </View>
            <CustomInput
              leftIcon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
              error={passwordError}
              containerStyle={styles.inputSpacing}
            />

            {loginError !== '' && (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
                <Text style={styles.errorBannerText}>{loginError}</Text>
              </View>
            )}

            <CustomButton
              label="Ingresar"
              rightIcon={
                <Ionicons name="arrow-forward" size={18} color={theme.colors.textOnPrimary} />
              }
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />
          </View>

          {/* ── Acceso rápido para Ciudadanos ──────────────── */}
          <View style={styles.citizenSection}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATENCIÓN AL CIUDADANO</Text>
              <View style={styles.dividerLine} />
            </View>
            <Text style={styles.citizenQuestion}>¿Eres Ciudadano?</Text>
            <View style={styles.citizenActions}>
              <TouchableOpacity
                style={styles.citizenBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="headset-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.citizenBtnText}>Radicar PQRS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.citizenBtn}
                onPress={() => router.push('/(auth)/register')}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="book-outline"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.citizenBtnText}>Guía Reciclaje</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: theme.spacing.huge,
  },

  // ── Logo ────────────────────────────────────────────────
  logoSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.huge,
    paddingBottom: theme.spacing.xxxl,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  titleGreen: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // ── Formulario ──────────────────────────────────────────
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.md,
    marginBottom: theme.spacing.xxxl,
  },
  inputSpacing: {
    marginBottom: theme.spacing.md,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  passwordLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
  },
  forgotLink: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorBannerText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
  },
  loginBtn: {
    marginTop: theme.spacing.md,
  },

  // ── Sección Ciudadano ───────────────────────────────────
  citizenSection: {
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.md,
    letterSpacing: 0.8,
  },
  citizenQuestion: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  citizenActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  citizenBtn: {
    flex: 1,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  citizenBtnText: {
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
