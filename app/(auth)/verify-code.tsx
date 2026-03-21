import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { flow, phone, cedula } = useLocalSearchParams<{
    flow: 'register' | 'forgot';
    phone?: string;
    cedula?: string;
  }>();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));

  // Countdown timer para reenviar código
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function handleOtpChange(text: string, index: number) {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    // Auto-avanzar al siguiente campo
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    // Volver al campo anterior en backspace vacío
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    if (!canResend) return;
    setCountdown(RESEND_SECONDS);
    setCanResend(false);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    // ⚠️ Llamar a la API para reenviar el código SMS
    // await AuthApi.resendCode({ cedula, phone });
  }

  const handleVerify = useCallback(async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Ingresa los 6 dígitos del código');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // ⚠️ Reemplazar con verificación real contra la API:
      // await AuthApi.verifyCode({ code, cedula, flow });
      await new Promise((r) => setTimeout(r, 800));

      if (flow === 'register') {
        router.push('/(auth)/verified');
      } else {
        router.push({ pathname: '/(auth)/new-password', params: { cedula } });
      }
    } catch {
      setError('Código incorrecto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [otp, flow, cedula, router]);

  const displayPhone = phone ? `+57 ••• ••• ${phone}` : 'tu teléfono registrado';
  const countdownFormatted = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;

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
          {/* ── Botón atrás ───────────────────────────────── */}
          <TouchableOpacity
            onPress={router.back}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          {/* ── Ícono ─────────────────────────────────────── */}
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={32}
                color={theme.colors.primary}
              />
            </View>
          </View>

          {/* ── Título ────────────────────────────────────── */}
          <Text style={styles.title}>Verifica tu Identidad</Text>
          <Text style={styles.subtitle}>
            Hemos enviado un código de {OTP_LENGTH} dígitos a tu teléfono{'\n'}
            <Text style={styles.subtitleBold}>{displayPhone}</Text>
          </Text>

          {/* ── Inputs OTP ────────────────────────────────── */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit !== '' && styles.otpBoxFilled,
                  error !== '' && styles.otpBoxError,
                ]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  handleKeyPress(nativeEvent.key, index)
                }
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectionColor={theme.colors.primary}
              />
            ))}
          </View>

          {error !== '' && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          {/* ── Botón verificar ───────────────────────────── */}
          <CustomButton
            label="Verificar Código"
            onPress={handleVerify}
            loading={loading}
            style={styles.verifyBtn}
          />

          {/* ── Reenviar código ───────────────────────────── */}
          <View style={styles.resendSection}>
            <Text style={styles.resendQuestion}>¿No recibiste el código?</Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Reenviar código</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.countdownText}>
                Reenviar en{' '}
                <Text style={styles.countdownGreen}>{countdownFormatted}</Text>
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Watermark ────────────────────────────────────── */}
      <View style={styles.watermark}>
        <Ionicons
          name="sync-circle"
          size={20}
          color={theme.colors.primaryLight}
        />
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

  // ── Navegación ───────────────────────────────────────────
  backBtn: {
    marginTop: theme.spacing.md,
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  // ── Ícono ────────────────────────────────────────────────
  iconSection: {
    alignItems: 'flex-start',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Textos ───────────────────────────────────────────────
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
    marginBottom: theme.spacing.xxxl,
  },
  subtitleBold: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },

  // ── OTP ──────────────────────────────────────────────────
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.sizes.h2,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  otpBoxError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },

  // ── Botón ────────────────────────────────────────────────
  verifyBtn: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },

  // ── Reenviar ─────────────────────────────────────────────
  resendSection: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  resendQuestion: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },
  countdownText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
  },
  countdownGreen: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },

  // ── Watermark ────────────────────────────────────────────
  watermark: {
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
  },
});
