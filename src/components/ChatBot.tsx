import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/src/theme/theme';
import { useAuth } from '@/src/hooks/useAuth';

// ── Configuración Gemini ─────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_MODEL   = 'gemini-2.5-flash';
const GEMINI_URL     = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `Eres el asistente inteligente de una ECA (Estación de Clasificación y Aprovechamiento de Residuos Sólidos) en Colombia.

Tu función es ayudar al administrador, recicladores, ciudadanía y supervisores — en el día a día del centro de reciclaje.

Puedes ayudar con:
- Consultas de inventario y materiales en bodega
- Registro y seguimiento de pesajes de recicladores
- Precios de compra y venta de materiales por kilo
- Despachos y ventas a compradores
- Reportes del día, la semana o el mes
- Alertas de stock bajo o recicladores inactivos

Reglas para responder:
- Habla en español colombiano, de forma clara y directa
- Respuestas cortas y al punto — máximo 4 oraciones
- Los precios siempre en formato $XX.XXX COP/kg
- Los pesos siempre en kilogramos (kg)
- Si no tienes el dato exacto, dilo honestamente y orienta al usuario a dónde buscarlo
- Nunca inventes cifras ni supongas datos que no tienes`;

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

// ── Tipos ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// ── Llamada a Gemini ─────────────────────────────────────────────────────────
async function callGemini(history: Message[], userText: string): Promise<string> {
  const contents = [
    ...history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    })),
    { role: 'user', parts: [{ text: userText }] },
  ];

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 256,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No obtuve respuesta.';
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
  const [isOpen, setIsOpen]   = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Resetear memoria del chat cuando cambia la sesión (otro usuario)
  useEffect(() => {
    setMessages([]);
    setInput('');
    setIsOpen(false);
  }, [user?.id]);

  // Mensaje de bienvenida al abrir por primera vez
  const openChat = () => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        text: `¡Hola${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! Soy tu asistente de la ECA. ¿En qué te puedo ayudar hoy?`,
        timestamp: new Date(),
      }]);
    }
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    scrollToBottom();

    try {
      const reply = await callGemini(
        messages.filter((m) => m.id !== 'welcome'),
        text,
      );
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', text: reply, timestamp: new Date() },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          text: 'Ups, no pude conectarme. Verifica tu conexión e intenta de nuevo.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {/* ── FAB flotante ───────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openChat}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color={theme.colors.textOnPrimary} />
      </TouchableOpacity>

      {/* ── Modal del chat ─────────────────────────────────── */}
      <Modal
        visible={isOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
            {/* ── Header ───────────────────────────────────── */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.chatHeaderAvatar}>
                  <Ionicons name="leaf" size={20} color={theme.colors.textOnPrimary} />
                </View>
                <View>
                  <Text style={styles.chatHeaderTitle}>Asistente ECA</Text>
                  <Text style={styles.chatHeaderSub}>Powered by Gemini</Text>
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

              {/* Preguntas sugeridas — solo visibles si no hay conversación aún */}
              {messages.length <= 1 && !loading && user?.role && (SUGGESTED_QUESTIONS[user.role] ?? []).length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsLabel}>Preguntas frecuentes</Text>
                  {(SUGGESTED_QUESTIONS[user.role] ?? []).map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={styles.suggestionChip}
                      onPress={() => {
                        setInput(q);
                        // Enviar directamente sin esperar al usuario
                        const text = q;
                        const userMsg: Message = {
                          id: Date.now().toString(),
                          role: 'user',
                          text,
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, userMsg]);
                        setInput('');
                        setLoading(true);
                        scrollToBottom();
                        callGemini(
                          messages.filter((m) => m.id !== 'welcome'),
                          text,
                        )
                          .then((reply) => {
                            setMessages((prev) => [
                              ...prev,
                              { id: Date.now().toString(), role: 'assistant', text: reply, timestamp: new Date() },
                            ]);
                          })
                          .catch(() => {
                            setMessages((prev) => [
                              ...prev,
                              {
                                id: Date.now().toString(),
                                role: 'assistant',
                                text: 'Ups, no pude conectarme. Verifica tu conexión e intenta de nuevo.',
                                timestamp: new Date(),
                              },
                            ]);
                          })
                          .finally(() => {
                            setLoading(false);
                            scrollToBottom();
                          });
                      }}
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

  // ── Modal overlay ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    maxHeight: '85%',
    minHeight: '60%',
    overflow: 'hidden',
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
