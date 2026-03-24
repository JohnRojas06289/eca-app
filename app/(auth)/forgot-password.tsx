import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { CustomInput } from '@/src/components/CustomInput';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError('Ingrese su correo electrónico');
      return false;
    }
    if (!email.includes('@')) {
      setEmailError('Ingrese un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  }

  async function handleSendCode() {
    if (!validate()) return;
    setLoading(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await AuthApi.sendRecoveryCode({ email });
      await new Promise((r) => setTimeout(r, 800));
      router.push({
        pathname: '/(auth)/verify-code',
        params: { flow: 'forgot', email },
      });
    } catch {
      setEmailError('No encontramos una cuenta con ese correo.');
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
          {/* ── Header ────────────────────────────────────── */}
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
            <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* ── Ícono y título ────────────────────────────── */}
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="lock-open-outline"
                size={36}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.title}>Recuperar Contraseña</Text>
            <Text style={styles.subtitle}>
              Ingresa tu correo electrónico para recibir un código de recuperación
            </Text>
          </View>

          {/* ── Formulario ────────────────────────────────── */}
          <CustomInput
            label="Correo Electrónico"
            leftIcon="mail-outline"
            placeholder="correo@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={emailError}
          />

          <CustomButton
            label="Enviar Código"
            onPress={handleSendCode}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity
            onPress={() => router.replace('/(auth)')}
            style={styles.backToLoginBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Watermark inferior ────────────────────────────── */}
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
    marginBottom: theme.spacing.huge,
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

  // ── Ícono ────────────────────────────────────────────────
  iconSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  iconCircle: {
    width: 80,
    height: 80,
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
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    paddingHorizontal: theme.spacing.md,
  },

  // ── Acciones ─────────────────────────────────────────────
  submitBtn: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  backToLoginBtn: {
    alignSelf: 'center',
  },
  backToLoginText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
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
