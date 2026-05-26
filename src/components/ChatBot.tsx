import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { API_BASE_URL, ENABLE_DEMO_CHAT } from '@/src/config/env';
import { apiRequest } from '@/src/services/api';

// ── Preguntas sugeridas por rol ───────────────────────────────────────────────
const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  admin: [
    '¿Cuáles materiales tienen el mejor precio esta semana?',
    '¿Cómo registro un nuevo pesaje para un reciclador?',
    '¿Cuántos recicladores estuvieron inactivos este mes?',
    '¿Cómo interpreto el reporte de compras vs ventas?',
  ],
  recycler: [
    '¿Cuáles materiales pagan mejor por kilo hoy?',
    '¿Cómo confirmo un pesaje que el admin registró?',
    '¿Qué materiales generan más valor esta semana?',
    '¿Cómo reporto una incidencia en la recolección?',
  ],
  supervisor: [
    '¿Cuánto fue el total de ventas del mes?',
    '¿Cuál es el margen operativo actual?',
    '¿Cuántos recicladores están activos este mes?',
    '¿Cómo leo el comparativo de compras y ventas?',
  ],
  citizen: [
    '¿Cómo separo correctamente mis residuos?',
    '¿Cuándo pasa el camión de recolección por mi zona?',
    '¿Qué materiales reciben en la ECA?',
    '¿Cómo solicito un servicio de recolección a domicilio?',
  ],
};

// ── Respuestas demo quemadas por rol ─────────────────────────────────────────
const DEMO_RESPONSES: Record<string, Array<{ keywords: string[]; reply: string }>> = {
  admin: [
    {
      keywords: ['precio', 'mejor precio', 'semana', 'paga', 'vale', 'cuesta'],
      reply: 'No tengo acceso a los precios en tiempo real en este modo. Revisa Gestión de Precios > Tarifas Actuales para ver cuál material lidera esta semana y comparar el histórico de la semana.',
    },
    {
      keywords: ['pesaje', 'registrar', 'registro', 'nuevo pesaje', 'cómo registro'],
      reply: 'Para registrar un pesaje: selecciona al reciclador, elige el material, ingresa el peso en kg y guarda. Si necesitas validarlo después, lo encuentras en el detalle del pesaje desde la sección de operaciones.',
    },
    {
      keywords: ['inactivo', 'inactivos', 'sin actividad', 'no han entregado'],
      reply: 'No veo el padrón real de actividad en este modo. Revisa Reportes Operativos o Gestión de Recicladores y filtra por este mes para identificar quién no ha registrado entregas.',
    },
    {
      keywords: ['reporte', 'compras', 'ventas', 'interpreto', 'comparativo', 'informe'],
      reply: 'El reporte muestra cuánto paga la ECA a recicladores (compras) frente a cuánto ingresa por la venta de material (ventas). Si las ventas superan las compras, hay margen positivo; si están muy cerca, la operación está más ajustada.',
    },
  ],
  recycler: [
    {
      keywords: ['precio', 'pagan', 'mejor', 'kilo', 'valor', 'cuánto pagan'],
      reply: 'No tengo el precio vigente en tiempo real en este modo. Revisa tus Tarifas Actuales para ver qué material te paga mejor por kilo hoy y priorizar lo que más conviene entregar.',
    },
    {
      keywords: ['confirmar', 'confirmo', 'validar', 'pesaje', 'admin registró'],
      reply: 'Para confirmar tu pesaje, abre Mis Pesajes, busca el registro pendiente y toca Confirmar. Si ves un dato incorrecto, repórtalo de inmediato para que el administrador lo revise.',
    },
    {
      keywords: ['incidencia', 'reportar', 'problema', 'reporto'],
      reply: 'Para reportar una incidencia, entra a Alertas y describe lo sucedido con el mayor detalle posible. Si puedes, agrega fotos o referencias para que el supervisor la revise más rápido.',
    },
    {
      keywords: ['generan', 'material', 'semana', 'más valor'],
      reply: 'En general, los materiales limpios, secos y bien separados suelen generar más valor. Si me compartes las tarifas vigentes, te ayudo a identificar cuáles te conviene priorizar.',
    },
  ],
  supervisor: [
    {
      keywords: ['total', 'ventas', 'mes', 'cuánto fue'],
      reply: 'Revisa el total de ventas del periodo y compáralo con el mes anterior para ver si la operación creció o se frenó. Si quieres, te ayudo a leer el reporte por material o por margen.',
    },
    {
      keywords: ['margen', 'operativo', 'margen operativo'],
      reply: 'El margen operativo te muestra cuánto queda después de pagar las compras a recicladores frente a lo que entra por ventas. Un margen más alto suele indicar mejor eficiencia, pero siempre hay que leerlo junto con el volumen movido.',
    },
    {
      keywords: ['activos', 'recicladores', 'cuántos', 'participación'],
      reply: 'El indicador de activos te dice cuántos recicladores sí registraron entregas en el periodo. Si cae, conviene revisar rutas, frecuencia y alertas de seguimiento.',
    },
    {
      keywords: ['comparativo', 'leo', 'leer', 'compras', 'ventas'],
      reply: 'El comparativo muestra dos lados del negocio: lo que se paga por material recibido y lo que se ingresa por su venta. Si la línea de ventas se mantiene por encima de compras, la operación está generando valor.',
    },
  ],
  citizen: [
    {
      keywords: ['separo', 'separar', 'residuos', 'basura', 'cómo separo'],
      reply: 'Separa tus residuos en reciclables, orgánicos y no reciclables. Lo ideal es entregar reciclables limpios y secos para que sí se puedan aprovechar.',
    },
    {
      keywords: ['camión', 'recolección', 'pasa', 'cuándo', 'horario'],
      reply: 'Consulta la ruta programada de tu sector en la app para ver el horario exacto de recolección. Si quieres, te ayudo a ubicar la opción correcta.',
    },
    {
      keywords: ['materiales', 'reciben', 'eca', 'qué reciben', 'aceptan'],
      reply: 'En la ECA recibimos materiales limpios y secos como cartón, papel, plástico, vidrio y metal. Evita llevar residuos contaminados con comida o mezclados con basura común.',
    },
    {
      keywords: ['domicilio', 'solicitar', 'servicio', 'recolección a domicilio'],
      reply: 'Para solicitar recolección a domicilio, entra a la opción de servicio domiciliario y registra tu solicitud con dirección y tipo de material. Si no ves esa opción, revisa con soporte de la app.',
    },
  ],
};

const DEMO_DEFAULT: Record<string, string> = {
  admin:      'Como administrador puedes gestionar pesajes, usuarios y precios desde el menú principal. ¿Necesitas ayuda con alguna función específica?',
  recycler:   'Puedes ver tus pesajes, precios actuales y rutas desde el menú principal. ¿En qué te puedo ayudar hoy?',
  supervisor: 'Como supervisora tienes acceso a todos los reportes consolidados. ¿Quieres el resumen del mes, comparativo de materiales o indicadores de recicladores?',
  citizen:    '¡Hola! Puedo ayudarte con separación de residuos, horarios de recolección y puntos de entrega en Zipaquirá. ¿Qué necesitas saber?',
};

function getDemoResponse(text: string, role: string): string {
  const t = text.toLowerCase();
  const entries = DEMO_RESPONSES[role] ?? DEMO_RESPONSES.citizen;
  for (const entry of entries) {
    if (entry.keywords.some((kw) => t.includes(kw))) return entry.reply;
  }
  return DEMO_DEFAULT[role] ?? '¿En qué te puedo ayudar hoy?';
}

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// ── Burbuja de mensaje ───────────────────────────────────────────────────────
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowBot]}>
      {!isUser && (
        <View style={styles.botAvatar}>
          <Ionicons name="leaf" size={14} color={theme.colors.textOnPrimary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextBot]}>
          {message.text}
        </Text>
        <Text style={[styles.bubbleTime, isUser ? styles.bubbleTimeUser : styles.bubbleTimeBot]}>
          {message.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

// ── Indicador de escritura ───────────────────────────────────────────────────
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0,  duration: 300, useNativeDriver: true }),
          Animated.delay(600),
        ]),
      );
    const a1 = anim(dot1, 0);
    const a2 = anim(dot2, 150);
    const a3 = anim(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.bubbleRow}>
      <View style={styles.botAvatar}>
        <Ionicons name="leaf" size={14} color={theme.colors.textOnPrimary} />
      </View>
      <View style={styles.bubbleBot}>
        <View style={styles.typingDots}>
          {[dot1, dot2, dot3].map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.typingDot, { transform: [{ translateY: dot }] }]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────
export function ChatBot() {
  const { isAuthenticated, user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 900;
  const [isOpen, setIsOpen]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const messagesRef = useRef<Message[]>([]);
  const loadingRef = useRef(false);

  // Resetear memoria del chat cuando cambia la sesión (otro usuario)
  useEffect(() => {
    setMessages([]);
    messagesRef.current = [];
    loadingRef.current = false;
    setInput('');
    setIsOpen(false);
    setConversationId(null);
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Mensaje de bienvenida al abrir por primera vez
  const openChat = () => {
    if (messages.length === 0) {
      const welcome: Message = {
        id: 'welcome',
        role: 'assistant',
        text: `¡Hola${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Soy tu asistente de ZipaRecicla. Te ayudo con precios, reportes, pesajes y consultas operativas.`,
        timestamp: new Date(),
      };
      setMessages([welcome]);
      messagesRef.current = [welcome];
    }
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendMessage = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text || loadingRef.current) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    const historyWithUser = [...messagesRef.current, userMsg];
    setMessages(historyWithUser);
    messagesRef.current = historyWithUser;
    setInput('');
    loadingRef.current = true;
    setLoading(true);
    scrollToBottom();

    try {
      let reply: string;

      if (API_BASE_URL && user?.token) {
        const data = await apiRequest<{ conversationId: string; reply: string }>('/api/chat', {
          method: 'POST',
          token: user.token,
          timeoutMs: 30000,
          body: {
            message: text,
            conversationId: conversationId ?? undefined,
          },
        });
        setConversationId(data.conversationId);
        reply = data.reply;
      } else if (ENABLE_DEMO_CHAT) {
        // Modo demo — sin backend configurado
        await new Promise((r) => setTimeout(r, 700));
        reply = getDemoResponse(text, user?.role ?? 'citizen');
      } else {
        reply = 'El asistente no está configurado en este ambiente.';
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: reply,
        timestamp: new Date(),
      };
      const nextHistory = [...historyWithUser, assistantMsg];
      setMessages(nextHistory);
      messagesRef.current = nextHistory;
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'Lo siento, no pude procesar tu mensaje. Intenta de nuevo.',
        timestamp: new Date(),
      };
      const nextHistory = [...historyWithUser, errorMsg];
      setMessages(nextHistory);
      messagesRef.current = nextHistory;
    } finally {
      loadingRef.current = false;
      setLoading(false);
      scrollToBottom();
    }
  }, [conversationId, user?.id, user?.role]);

  async function handleSend() {
    await sendMessage(input);
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── FAB flotante ───────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.fab, Platform.OS === 'web' && styles.fabWeb, isMobileWeb && styles.fabWebMobile]}
        onPress={openChat}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color={theme.colors.textOnPrimary} />
      </TouchableOpacity>

      {/* ── Modal del chat ─────────────────────────────────── */}
      <Modal
        visible={isOpen}
        animationType="fade"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={[styles.modalOverlay, Platform.OS === 'web' && styles.modalOverlayWeb]}>
          <SafeAreaView
            style={[styles.modalContainer, Platform.OS === 'web' && styles.modalContainerWeb]}
            edges={['top', 'bottom']}
          >
            {/* ── Header ───────────────────────────────────── */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.chatHeaderAvatar}>
                  <Ionicons name="leaf" size={20} color={theme.colors.textOnPrimary} />
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>Asistente ECA</Text>
                  <Text style={styles.chatHeaderSub}>Asistente ZipaRecicla</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.closeBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* ── Mensajes ─────────────────────────────────── */}
            <ScrollView
              ref={scrollRef}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToBottom}
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}

              {/* Preguntas sugeridas — siempre visibles */}
              {!loading && user?.role && (SUGGESTED_QUESTIONS[user.role] ?? []).length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsLabel}>Preguntas frecuentes</Text>
                  {(SUGGESTED_QUESTIONS[user.role] ?? []).map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={styles.suggestionChip}
                      onPress={() => sendMessage(q)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.suggestionText}>{q}</Text>
                      <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {loading && <TypingIndicator />}
            </ScrollView>

            {/* ── Input ────────────────────────────────────── */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Escribe tu consulta..."
                  placeholderTextColor={theme.colors.textMuted}
                  multiline
                  maxLength={500}
                  returnKeyType="send"
                  onSubmitEditing={handleSend}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
                  onPress={handleSend}
                  disabled={!input.trim() || loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
                  ) : (
                    <Ionicons name="send" size={18} color={theme.colors.textOnPrimary} />
                  )}
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── FAB ──────────────────────────────────────────────────
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    ...theme.shadows.lg,
  },
  fabWeb: {
    bottom: 'calc(28px + env(safe-area-inset-bottom, 0px))' as any,
    right: 28,
    cursor: 'pointer' as any,
  },
  // En mobile web el tab bar tiene 64px de alto → subimos el FAB por encima
  fabWebMobile: {
    bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' as any,
  },

  // ── Modal overlay ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.56)',
    justifyContent: 'flex-end',
  },
  modalOverlayWeb: {
    backgroundColor: 'rgba(2, 6, 23, 0.38)',
    alignItems: 'flex-end',
    padding: theme.spacing.xxl,
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    maxHeight: '85%',
    minHeight: '60%',
    overflow: 'hidden',
  },
  modalContainerWeb: {
    width: 420,
    maxWidth: '100%',
    height: 640,
    minHeight: 0,
    maxHeight: '88%',
    borderRadius: theme.radius.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
  },

  // ── Header ───────────────────────────────────────────────
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.separator,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderTitle: {
    fontSize: theme.typography.sizes.h4,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  chatHeaderSub: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.separator,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Mensajes ─────────────────────────────────────────────
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },

  // ── Burbujas ─────────────────────────────────────────────
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: theme.radius.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  bubbleUser: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: theme.radius.xs,
  },
  bubbleBot: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: theme.radius.xs,
    ...theme.shadows.sm,
  },
  bubbleText: {
    fontSize: theme.typography.sizes.body,
    lineHeight: theme.typography.sizes.body * theme.typography.lineHeights.normal,
  },
  bubbleTextUser: {
    color: theme.colors.textOnPrimary,
  },
  bubbleTextBot: {
    color: theme.colors.textPrimary,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'right',
  },
  bubbleTimeBot: {
    color: theme.colors.textMuted,
  },

  // ── Preguntas sugeridas ───────────────────────────────────
  suggestionsContainer: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  suggestionsLabel: {
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '40',
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  suggestionText: {
    flex: 1,
    fontSize: theme.typography.sizes.small,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.sizes.small * 1.4,
  },

  // ── Typing indicator ─────────────────────────────────────
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textMuted,
  },

  // ── Input ─────────────────────────────────────────────────
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.separator,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.xl,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.sizes.body,
    color: theme.colors.textPrimary,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.circle,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: {
    backgroundColor: theme.colors.disabled,
  },
});
