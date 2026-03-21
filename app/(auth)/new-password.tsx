import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { CustomInput } from '@/src/components/CustomInput';

interface ValidationRule {
  label: string;
  passed: boolean;
}

export default function NewPasswordScreen() {
  const router = useRouter();
  const { cedula } = useLocalSearchParams<{ cedula?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const validations: ValidationRule[] = useMemo(
    () => [
      { label: 'Al menos 8 caracteres', passed: password.length >= 8 },
      { label: 'Una letra mayúscula', passed: /[A-Z]/.test(password) },
      {
        label: 'Un número o símbolo',
        passed: /[0-9!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password),
      },
    ],
    [password],
  );

  const allRulesPassed = validations.every((v) => v.passed);

  function validate(): boolean {
    if (!allRulesPassed) return false;
    if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden');
      return false;
    }
    setConfirmError('');
    return true;
  }

  async function handleReset() {
    if (!validate()) return;
    setLoading(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await AuthApi.resetPassword({ cedula, newPassword: password });
      await new Promise((r) => setTimeout(r, 800));
      router.replace({
        pathname: '/(auth)/success',
        params: { type: 'password' },
      });
    } catch {
      setConfirmError('Error al restablecer la contraseña. Intenta de nuevo.');
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
            <Text style={styles.headerBrand}>ZipaRecicla</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* ── Título ────────────────────────────────────── */}
          <Text style={styles.title}>Nueva Contraseña</Text>
          <Text style={styles.subtitle}>
            Crea una contraseña segura de al menos 8 caracteres
          </Text>

          {/* ── Inputs ────────────────────────────────────── */}
          <CustomInput
            label="Nueva Contraseña"
            leftIcon="lock-closed-outline"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChangeText={setPassword}
            isPassword
            containerStyle={styles.inputSpacing}
          />
          <CustomInput
            label="Confirmar Contraseña"
            leftIcon="lock-closed-outline"
            placeholder="Repite tu nueva contraseña"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmError('');
            }}
            isPassword
            error={confirmError}
          />

          {/* ── Reglas de validación ──────────────────────── */}
          <View style={styles.rulesContainer}>
            {validations.map((rule, index) => (
              <View key={index} style={styles.ruleRow}>
                <Ionicons
                  name={rule.passed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={
                    rule.passed ? theme.colors.primary : theme.colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.ruleText,
                    rule.passed && styles.ruleTextPassed,
                  ]}
                >
                  {rule.label}
                </Text>
              </View>
            ))}
          </View>

          {/* ── Botón y cancelar ──────────────────────────── */}
          <CustomButton
            label="Restablecer Contraseña"
            rightIcon={
              <Ionicons
                name="refresh-circle-outline"
                size={18}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={handleReset}
            loading={loading}
            disabled={!allRulesPassed}
            style={styles.submitBtn}
          />
          <TouchableOpacity
            onPress={() => router.replace('/(auth)')}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
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
    marginBottom: theme.spacing.xxxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerBrand: {
    flex: 1,
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // ── Textos ───────────────────────────────────────────────
  title: {
    fontSize: theme.typography.sizes.h1,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.sizes.body * 1.5,
    marginBottom: theme.spacing.xxxl,
  },

  // ── Inputs ───────────────────────────────────────────────
  inputSpacing: {
    marginBottom: theme.spacing.lg,
  },

  // ── Reglas ───────────────────────────────────────────────
  rulesContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  ruleText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
  },
  ruleTextPassed: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.medium,
  },

  // ── Acciones ─────────────────────────────────────────────
  submitBtn: {
    marginBottom: theme.spacing.lg,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.sm,
  },
  cancelText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
});
