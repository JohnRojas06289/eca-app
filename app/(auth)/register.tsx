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
import { SelectableCard } from '@/src/components/SelectableCard';
import type { UserRole } from '@/src/hooks/useAuth';
import { API_BASE_URL, USE_DEMO_AUTH } from '@/src/config/env';
import { registerWithApi } from '@/src/services/auth';

type RegisterRole = Extract<UserRole, 'citizen' | 'recycler'>;

interface FormErrors {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<RegisterRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({
    name: '',
    email: '',
    phone: '',
    role: '',
  });

  function validate(): boolean {
    const newErrors: FormErrors = { name: '', email: '', phone: '', role: '' };
    let valid = true;

    if (!name.trim()) {
      newErrors.name = 'Ingrese su nombre completo';
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = 'Ingrese su correo electrónico';
      valid = false;
    } else if (!email.includes('@')) {
      newErrors.email = 'Ingrese un correo electrónico válido';
      valid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = 'Ingrese su número de teléfono';
      valid = false;
    } else if (phone.trim().length < 10) {
      newErrors.phone = 'Ingrese un número de teléfono válido (10 dígitos)';
      valid = false;
    }
    if (!role) {
      newErrors.role = 'Seleccione un rol para continuar';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      if (API_BASE_URL && !USE_DEMO_AUTH && role) {
        await registerWithApi({ name, email, phone, role });
      } else {
        // Modo demo controlado por env: permite revisar el frontend sin backend.
        await new Promise((r) => setTimeout(r, 800));
      }
      router.push({
        pathname: '/(auth)/verify-code',
        params: { flow: 'register', phone: phone.slice(-4) },
      });
    } catch {
      // Manejar error de la API
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
          {/* ── Header con botón atrás ─────────────────────── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={router.back}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={theme.colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Registrarse</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* ── Logo y título ──────────────────────────────── */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/logo.jpeg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Únete a ECA App</Text>
            <Text style={styles.subtitle}>
              Completa tus datos para empezar a transformar el planeta.
            </Text>
          </View>

          {/* ── Campos del formulario ──────────────────────── */}
          <CustomInput
            label="Nombre Completo"
            leftIcon="person-outline"
            placeholder="Ej: Juan Pérez"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />
          <CustomInput
            label="Correo Electrónico"
            leftIcon="mail-outline"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <CustomInput
            label="Número de Teléfono"
            leftIcon="call-outline"
            placeholder="300 123 4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          {/* ── Selección de Rol ───────────────────────────── */}
          <Text style={styles.roleLabel}>Selecciona tu Rol</Text>
          {errors.role !== '' && (
            <Text style={styles.roleError}>{errors.role}</Text>
          )}
          <SelectableCard
            layout="list"
            label="Reciclador"
            subtitle="Gestión de residuos recolectados"
            icon="leaf-outline"
            selected={role === 'recycler'}
            onPress={() => setRole('recycler')}
          />
          <SelectableCard
            layout="list"
            label="Ciudadano"
            subtitle="Solicitud de recolección en casa"
            icon="home-outline"
            selected={role === 'citizen'}
            onPress={() => setRole('citizen')}
          />

          {/* ── Botón y link de login ──────────────────────── */}
          <CustomButton
            label="Crear Cuenta"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
          <View style={styles.loginLinkRow}>
            <Text style={styles.loginLinkText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
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

  // ── Header ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // ── Logo ────────────────────────────────────────────────
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
  },

  // ── Rol ─────────────────────────────────────────────────
  roleLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  roleError: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: theme.spacing.sm,
  },

  // ── Footer ──────────────────────────────────────────────
  submitBtn: {
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.lg,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  loginLink: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
