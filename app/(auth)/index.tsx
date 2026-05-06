import { useState } from 'react';
import {
  View,
  Text,
  Image,
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
import type { UserRole } from '@/src/hooks/useAuth';
import { isWeb } from '@/src/theme/responsive';
import { API_BASE_URL, ENABLE_DEMO_LOGIN, USE_DEMO_AUTH } from '@/src/config/env';
import { loginWithApi } from '@/src/services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    let valid = true;

    if (!email.trim()) {
      setEmailError('Ingrese su correo electrónico');
      valid = false;
    } else if (!email.includes('@')) {
      setEmailError('Ingrese un correo electrónico válido');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!password.trim()) {
      setPasswordError('Ingrese su contraseña');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  }

  async function handleQuickLogin(role: UserRole) {
    if (!ENABLE_DEMO_LOGIN) return;

    const profiles = {
      admin:      { name: 'Carlos Administrador', email: 'admin@demo.com' },
      recycler:   { name: 'Juan Reciclador',       email: 'recycler@demo.com' },
      supervisor: { name: 'Ana Supervisora',        email: 'supervisor@demo.com' },
      citizen:    { name: 'María Ciudadana',        email: 'citizen@demo.com' },
      superadmin: { name: 'Super Admin',            email: 'superadmin@demo.com' },
    };
    const { name, email } = profiles[role];
    await signIn({ id: email, name, role, token: 'demo-token', email });
    router.replace(role === 'superadmin' ? '/(admin)' : `/(${role})` as any);
  }

  async function handleSuperAdminLogin() {
    setLoading(true);
    setLoginError('');
    try {
      const user = await loginWithApi({ email: 'superadmin@eca.com', password: 'EcaSuper2024!' });
      await signIn(user);
      router.replace('/(admin)');
    } catch {
      setLoginError('No se pudo conectar como superadmin. Verifica que el backend esté activo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setLoginError('');
    try {
      let role: UserRole;

      if (API_BASE_URL && !USE_DEMO_AUTH) {
        const user = await loginWithApi({ email, password });
        role = user.role;
        await signIn(user);
      } else if (USE_DEMO_AUTH) {
        // Modo demo controlado por env: útil para probar el frontend sin backend.
        await new Promise((r) => setTimeout(r, 600));
        const prefix = email.split('@')[0].toLowerCase();
        role =
          prefix === 'admin'       ? 'admin'      :
          prefix === 'recycler'    ? 'recycler'   :
          prefix === 'supervisor'  ? 'supervisor' :
          prefix === 'superadmin'  ? 'superadmin' :
          'citizen';
        const names: Record<UserRole, string> = {
          admin:      'Carlos Administrador',
          recycler:   'Juan Reciclador',
          supervisor: 'Ana Supervisora',
          citizen:    'María Ciudadana',
          superadmin: 'Super Admin',
        };
        await signIn({
          id: email,
          name: names[role],
          role,
          token: 'demo-token',
          email,
        });
      } else {
        setLoginError('El servicio de autenticación no está configurado.');
        return;
      }

      const destination =
        role === 'admin'      ? '/(admin)'      :
        role === 'recycler'   ? '/(recycler)'   :
        role === 'supervisor' ? '/(supervisor)' :
        role === 'superadmin' ? '/(admin)'      :
        '/(citizen)';
      router.replace(destination as any);
    } catch {
      setLoginError('Credenciales incorrectas. Verifica tu correo y contraseña.');
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
          contentContainerStyle={[styles.scroll, isWeb && styles.scrollWeb]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo y título ──────────────────────────────── */}
          <View style={[styles.logoSection, isWeb && styles.logoSectionWeb]}>
            <Image
              source={require('../../assets/logo.jpeg')}
              style={[styles.logo, isWeb && styles.logoWeb]}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              Bienvenido a{' '}
              <Text style={styles.titleGreen}>ECA App</Text>
            </Text>
            <Text style={styles.subtitle}>
              Gestiona tus residuos de forma inteligente
            </Text>
          </View>

          {/* ── Formulario de login ────────────────────────── */}
          <View style={[styles.formCard, isWeb && styles.formCardWeb]}>
            <CustomInput
              label="Correo Electrónico"
              leftIcon="mail-outline"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
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

          {ENABLE_DEMO_LOGIN && (
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessLabel}>Acceso rápido demo</Text>
              <View style={styles.quickAccessGrid}>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: '#2DC84D' }]}
                  onPress={() => handleQuickLogin('admin')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
                  <Text style={styles.quickBtnText}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: '#2980B9' }]}
                  onPress={() => handleQuickLogin('recycler')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bicycle-outline" size={16} color="#fff" />
                  <Text style={styles.quickBtnText}>Reciclador</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: '#8E44AD' }]}
                  onPress={() => handleQuickLogin('supervisor')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bar-chart-outline" size={16} color="#fff" />
                  <Text style={styles.quickBtnText}>Supervisor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, { backgroundColor: '#E67E22' }]}
                  onPress={() => handleQuickLogin('citizen')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="person-outline" size={16} color="#fff" />
                  <Text style={styles.quickBtnText}>Ciudadano</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.superadminBtn}
                onPress={handleSuperAdminLogin}
                activeOpacity={0.8}
                disabled={loading}
              >
                <Ionicons name="key-outline" size={16} color="#fff" />
                <Text style={styles.quickBtnText}>Superadmin (real)</Text>
              </TouchableOpacity>
            </View>
          )}
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
  scrollWeb: {
    justifyContent: 'center',
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
  },

  // ── Logo ────────────────────────────────────────────────
  logoSection: {
    alignItems: 'center',
    paddingTop: theme.spacing.huge,
    paddingBottom: theme.spacing.xxxl,
  },
  logoSectionWeb: {
    paddingTop: 0,
    paddingBottom: theme.spacing.xl,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: theme.spacing.xl,
  },
  logoWeb: {
    width: 128,
    height: 128,
    marginBottom: theme.spacing.lg,
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
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xxxl,
  },
  formCardWeb: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxl,
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

  // ── Acceso rápido demo ──────────────────────────────────
  quickAccessSection: {
    marginTop: theme.spacing.xxxl,
    alignItems: 'center',
  },
  quickAccessLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
    flexBasis: '47%',
    flexGrow: 1,
  },
  superadminBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.xl,
    backgroundColor: '#1a1a2e',
    width: '100%',
    marginTop: theme.spacing.xs,
  },
  quickBtnText: {
    color: '#fff',
    fontSize: theme.typography.sizes.small,
    fontWeight: theme.typography.weights.semibold,
  },
});
