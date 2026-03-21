import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { CustomButton } from '@/src/components/CustomButton';

type IncidentType = 'access' | 'security' | 'overload' | 'other';

interface IncidentOption {
  key: IncidentType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
}

const INCIDENT_TYPES: IncidentOption[] = [
  {
    key: 'access',
    label: 'Acceso Bloqueado',
    description: 'Obras, vehículo obstruyendo, puerta cerrada',
    icon: 'lock-closed-outline',
    color: theme.colors.error,
    bgColor: theme.colors.errorLight,
  },
  {
    key: 'security',
    label: 'Problema de Seguridad',
    description: 'Situación de riesgo en la zona',
    icon: 'shield-outline',
    color: theme.colors.warning,
    bgColor: theme.colors.warningLight,
  },
  {
    key: 'overload',
    label: 'Sobrecarga de Vehículo',
    description: 'El camión superó su capacidad máxima',
    icon: 'car-outline',
    color: theme.colors.info,
    bgColor: theme.colors.infoLight,
  },
  {
    key: 'other',
    label: 'Otro Incidente',
    description: 'Cualquier situación no contemplada',
    icon: 'ellipsis-horizontal-circle-outline',
    color: theme.colors.textSecondary,
    bgColor: theme.colors.separator,
  },
];

// Contexto de la ruta actual (en producción viene de la store / navigation params)
const CURRENT_STOP = {
  number: 15,
  name: 'Conjunto El Salitre',
  address: 'Calle 1 # 12-10, Villa Maria',
};

export default function ReportIncidentScreen() {
  const router = useRouter();
  const [incidentType, setIncidentType] = useState<IncidentType | null>(null);
  const [description,  setDescription]  = useState('');
  const [hasPhoto,     setHasPhoto]     = useState(false);
  const [sending,      setSending]      = useState(false);

  const canSubmit = incidentType !== null && description.trim().length >= 10;

  async function handleSend() {
    if (!canSubmit) return;
    setSending(true);
    try {
      // ⚠️ Reemplazar con llamada real a la API:
      // await RouteApi.reportIncident({ stopId: CURRENT_STOP.number, type: incidentType, description, hasPhoto });
      await new Promise((r) => setTimeout(r, 800));
      router.back();
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={router.back}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reportar Incidencia</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Contexto de parada ────────────────────────── */}
          <View style={styles.stopContextCard}>
            <View style={styles.stopNumberBg}>
              <Text style={styles.stopNumberText}>{CURRENT_STOP.number}</Text>
            </View>
            <View style={styles.stopContextInfo}>
              <Text style={styles.stopContextTag}>PARADA ACTUAL</Text>
              <Text style={styles.stopContextName}>{CURRENT_STOP.name}</Text>
              <Text style={styles.stopContextAddress} numberOfLines={1}>
                {CURRENT_STOP.address}
              </Text>
            </View>
            <Ionicons name="warning-outline" size={22} color={theme.colors.error} />
          </View>

          {/* ── Tipo de incidencia ────────────────────────── */}
          <Text style={styles.fieldLabel}>Tipo de Incidencia</Text>
          {INCIDENT_TYPES.map((opt) => {
            const isSelected = incidentType === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.incidentOption,
                  isSelected && {
                    borderColor: opt.color,
                    backgroundColor: opt.bgColor,
                  },
                ]}
                onPress={() => setIncidentType(opt.key)}
                activeOpacity={0.8}
              >
                <View style={[styles.incidentIconBg, { backgroundColor: opt.bgColor }]}>
                  <Ionicons name={opt.icon as any} size={22} color={opt.color} />
                </View>
                <View style={styles.incidentText}>
                  <Text
                    style={[
                      styles.incidentLabel,
                      isSelected && { color: opt.color },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  <Text style={styles.incidentDescription}>{opt.description}</Text>
                </View>
                <View
                  style={[
                    styles.radioOuter,
                    isSelected && { borderColor: opt.color },
                  ]}
                >
                  {isSelected && (
                    <View style={[styles.radioInner, { backgroundColor: opt.color }]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* ── Descripción ───────────────────────────────── */}
          <Text style={styles.fieldLabel}>Descripción</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe el problema en detalle para que el supervisor pueda actuar..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {description.length} caracteres (mínimo 10)
          </Text>

          {/* ── Adjuntar foto ─────────────────────────────── */}
          <Text style={styles.fieldLabel}>
            Evidencia fotográfica <Text style={styles.optionalTag}>(opcional)</Text>
          </Text>
          <TouchableOpacity
            style={[styles.photoUpload, hasPhoto && styles.photoUploadActive]}
            onPress={() => setHasPhoto((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={hasPhoto ? 'image' : 'camera-outline'}
              size={28}
              color={hasPhoto ? theme.colors.primary : theme.colors.textMuted}
            />
            <Text
              style={[
                styles.photoUploadText,
                hasPhoto && { color: theme.colors.primary },
              ]}
            >
              {hasPhoto ? 'Foto adjuntada' : 'Toca para adjuntar foto'}
            </Text>
            <Text style={styles.photoUploadHint}>
              {/* ⚠️ Integrar con expo-image-picker */}
              JPG o PNG, máx. 5 MB
            </Text>
          </TouchableOpacity>

          {/* ── Enviar reporte ────────────────────────────── */}
          <CustomButton
            label="Enviar Reporte"
            leftIcon={
              <Ionicons
                name="send-outline"
                size={18}
                color={theme.colors.textOnPrimary}
              />
            }
            variant="danger"
            onPress={handleSend}
            loading={sending}
            disabled={!canSubmit}
            style={styles.sendBtn}
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

  // ── Contexto parada ──────────────────────────────────────
  stopContextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
  },
  stopNumberBg: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stopNumberText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textOnPrimary,
  },
  stopContextInfo: { flex: 1 },
  stopContextTag: {
    fontSize: theme.typography.sizes.tiny,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.error,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  stopContextName: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  stopContextAddress: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },

  // ── Campos ───────────────────────────────────────────────
  fieldLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  optionalTag: {
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textMuted,
  },

  // ── Opciones de incidencia ───────────────────────────────
  incidentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  incidentIconBg: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  incidentText: { flex: 1 },
  incidentLabel: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  incidentDescription: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // ── Descripción ──────────────────────────────────────────
  descriptionInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    minHeight: 110,
    marginBottom: theme.spacing.xs,
  },
  charCount: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginBottom: theme.spacing.lg,
  },

  // ── Foto ─────────────────────────────────────────────────
  photoUpload: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xxl,
  },
  photoUploadActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  photoUploadText: {
    fontSize: theme.typography.sizes.body,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.textMuted,
  },
  photoUploadHint: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },

  sendBtn: {},
});
