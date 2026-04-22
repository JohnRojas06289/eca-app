import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cors from 'cors';
import { getConversationMessages, saveMessage, upsertConversation } from './db.js';

const app = express();

const PORT = Number(process.env.PORT || 4000);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const SYSTEM_PROMPT_BASE = `Eres el asistente inteligente de ZipaRecicla, la app oficial de la ECA (Estación de Clasificación y Aprovechamiento de Residuos Sólidos) del municipio de Zipaquirá, Colombia.

La ECA recibe, clasifica y comercializa materiales reciclables: cartón, plástico PET, vidrio, metal, papel de archivo y chatarra.
Los recicladores entregan material, el admin registra y valida pesajes, y la ECA vende los materiales clasificados a compradores mayoristas.

Tu función es ayudar en el día a día del centro según el rol del usuario:
- Consultas sobre materiales, inventario y precios vigentes
- Registro y seguimiento de pesajes
- Reportes operativos y financieros
- Guía sobre separación en la fuente y rutas de recolección para ciudadanos
- Alertas de stock bajo o recicladores inactivos

Reglas de respuesta:
- Habla en español colombiano, de forma cálida, clara y directa
- Respuestas concisas — máximo 4 oraciones, usa listas cortas si ayuda a la claridad
- Precios en formato $XX.XXX COP/kg
- Pesos en kilogramos (kg)
- Si no tienes un dato exacto, dilo con honestidad y orienta al usuario a dónde encontrarlo en la app
- Nunca inventes cifras ni supongas datos que no tienes`;

const ROLE_CONTEXT = {
  admin: `Estás hablando con CARLOS, el ADMINISTRADOR de la ECA.
Puede registrar pesajes, validar entregas, gestionar usuarios, consultar reportes completos y ajustar precios.
Dale respuestas técnicas y operativas. Puede manejar datos numéricos detallados.`,

  recycler: `Estás hablando con JUAN, un RECICLADOR de base registrado en la ECA.
Su interés principal: cuánto pesa su material, qué precio le pagan por kilo y cómo confirmar sus pesajes.
Usa lenguaje sencillo y directo. Evita tecnicismos. Si hay cifras, explícalas en términos de ganancias.`,

  supervisor: `Estás hablando con ANA, la SUPERVISORA MUNICIPAL de la ECA.
Su foco está en métricas agregadas: total de compras vs ventas, margen operativo, número de recicladores activos, cumplimiento de metas ambientales.
Dale respuestas con visión gerencial. Puede interpretar cifras y comparativos.`,

  citizen: `Estás hablando con un CIUDADANO de Zipaquirá.
Solo quiere saber cómo separar bien sus residuos, cuándo pasa el camión y cómo llevar material a la ECA.
Usa lenguaje muy simple y amigable. Sin tecnicismos. Motívalo a reciclar.`,
};

function buildSystemPrompt(userRole) {
  const roleCtx = ROLE_CONTEXT[userRole] ?? `Estás hablando con un usuario de la aplicación ZipaRecicla.`;
  return `${SYSTEM_PROMPT_BASE}\n\nContexto del usuario actual:\n${roleCtx}`;
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'eca-ai-backend' });
});

app.post('/api/chat', async (req, res) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: { message: 'Falta GEMINI_API_KEY en el backend.' } });
    }

    const message = String(req.body?.message || '').trim();
    const userId = req.body?.userId ? String(req.body.userId) : null;
    const userRole = req.body?.userRole ? String(req.body.userRole) : null;

    if (!message) {
      return res.status(400).json({ error: { message: 'El campo "message" es obligatorio.' } });
    }

    const conversationId = req.body?.conversationId
      ? String(req.body.conversationId)
      : crypto.randomUUID();

    await upsertConversation({ conversationId, userId, userRole });
    await saveMessage({ conversationId, sender: 'user', content: message });

    const history = await getConversationMessages(conversationId, 20);
    const contents = history.map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt(userRole) }] },
        contents,
        generationConfig: {
          temperature: 0.65,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!geminiRes.ok) {
      const err = await geminiRes.json().catch(() => ({}));
      return res.status(geminiRes.status).json({
        error: {
          message: err?.error?.message || `Gemini HTTP ${geminiRes.status}`,
        },
      });
    }

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No obtuve respuesta.';

    await saveMessage({ conversationId, sender: 'assistant', content: reply });

    return res.json({ conversationId, reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: { message: 'Error interno del servidor.' } });
  }
});

// En local levanta el servidor. En Vercel se exporta como handler.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`✅ Backend IA escuchando en http://localhost:${PORT}`);
  });
}

export default app;
