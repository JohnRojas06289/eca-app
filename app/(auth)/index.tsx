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
    } else {
      setCedulaError('');
    }

    if (!password.trim()) {
      setPasswordError('Ingrese su contraseña');
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
      const destination =
        role === 'admin'    ? '/(admin)'    :
        role === 'recycler' ? '/(recycler)' :
        '/(citizen)';
      router.replace(destination as any);
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

          {/* ── Link de registro ───────────────────────────── */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
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

  // ── Link de registro ────────────────────────────────────
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  registerLink: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
