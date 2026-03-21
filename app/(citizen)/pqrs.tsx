import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';
import { CustomInput } from '@/src/components/CustomInput';

type RequestType = 'Petición' | 'Queja' | 'Reclamo' | 'Sugerencia';

const REQUEST_TYPES: RequestType[] = ['Petición', 'Queja', 'Reclamo', 'Sugerencia'];

export default function PQRSScreen() {
  const router = useRouter();
  const [requestType, setRequestType] = useState<RequestType>('Petición');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoAttached, setPhotoAttached] = useState(false);

  const [errors, setErrors] = useState({ name: '', email: '', subject: '', description: '' });

  function validate(): boolean {
    const e = { name: '', email: '', subject: '', description: '' };
    let valid = true;

    if (!name.trim()) { e.name = 'Ingrese su nombre'; valid = false; }
    if (!email.trim()) { e.email = 'Ingrese su correo'; valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { e.email = 'Correo inválido'; valid = false; }
    if (!subject.trim()) { e.subject = 'Ingrese el asunto'; valid = false; }
    if (!description.trim()) { e.description = 'Ingrese una descripción'; valid = false; }
    else if (description.trim().length < 20) { e.description = 'Mínimo 20 caracteres'; valid = false; }

    setErrors(e);
    return valid;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setLoading(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await PQRSApi.submit({ type: requestType, name, email, subject, description });
      await new Promise((r) => setTimeout(r, 800));
      router.back();
    } catch {
      setErrors((prev) => ({
        ...prev,
        description: 'Error al enviar. Intenta de nuevo.',
      }));
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
        {/* ── Header ────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={router.back}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Radicar PQRS</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Selector de tipo ──────────────────────────── */}
          <Text style={styles.sectionLabel}>Tipo de solicitud</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.typeScroll}
            contentContainerStyle={styles.typeScrollContent}
          >
            {REQUEST_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  requestType === type && styles.typeChipActive,
                ]}
                onPress={() => setRequestType(type)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    requestType === type && styles.typeChipTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Campos del formulario ──────────────────────── */}
          <CustomInput
            label="Nombre completo"
            placeholder="Ej. Juan Pérez"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            error={errors.name}
          />
          <CustomInput
            label="Correo electrónico"
            placeholder="juan@ejemplo.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />
          <CustomInput
            label="Asunto"
            placeholder="Breve descripción del motivo"
            value={subject}
            onChangeText={setSubject}
            error={errors.subject}
          />

          {/* Descripción (multiline) */}
          <Text style={styles.descLabel}>Descripción</Text>
          <TextInput
            style={[
              styles.descInput,
              errors.description !== '' && styles.descInputError,
            ]}
            placeholder="Cuéntanos más detalles..."
            placeholderTextColor={theme.colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          {errors.description !== '' && (
            <Text style={styles.fieldError}>{errors.description}</Text>
          )}

          {/* ── Subir foto ────────────────────────────────── */}
          <Text style={styles.sectionLabel}>Subir evidencia fotográfica</Text>
          <TouchableOpacity
            style={[styles.photoUpload, photoAttached && styles.photoUploadAttached]}
            onPress={() => setPhotoAttached((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={photoAttached ? 'checkmark-circle' : 'camera-outline'}
              size={32}
              color={photoAttached ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.photoUploadText,
                photoAttached && styles.photoUploadTextAttached,
              ]}
            >
              {photoAttached ? 'Foto adjuntada' : 'Haz clic para subir o tomar foto'}
            </Text>
          </TouchableOpacity>

          {/* ── Botón de envío ────────────────────────────── */}
          <CustomButton
            label="Enviar Solicitud"
            leftIcon={
              <Ionicons
                name="send-outline"
                size={18}
                color={theme.colors.textOnPrimary}
              />
            }
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },

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

  // ── Tipo de solicitud ────────────────────────────────────
  sectionLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  typeScroll: { marginBottom: theme.spacing.xl },
  typeScrollContent: { gap: theme.spacing.sm },
  typeChip: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  typeChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  typeChipText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weights.medium,
  },
  typeChipTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weights.semibold,
  },

  // ── Descripción ──────────────────────────────────────────
  descLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  descInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    minHeight: 120,
    marginBottom: theme.spacing.xs,
  },
  descInputError: { borderColor: theme.colors.error },
  fieldError: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },

  // ── Foto ─────────────────────────────────────────────────
  photoUpload: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  photoUploadAttached: { borderColor: theme.colors.primary, borderStyle: 'solid' },
  photoUploadText: {
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  photoUploadTextAttached: { color: theme.colors.primary },
  submitBtn: { marginTop: theme.spacing.sm },
});
