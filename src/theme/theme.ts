// ============================================================
// ZIPARECICLA — Design System Tokens
// Extraído de las 27 pantallas del diseño Figma (Marzo 2026)
// ============================================================

export const theme = {
  colors: {
    // ── Marca ──────────────────────────────────────────────
    primary: '#2DC84D',          // Botones, tabs activos, texto de marca
    primaryLight: '#E8F9EE',     // Fondos de íconos, banners suaves
    primaryMid: '#C8EDD4',       // Bordes suaves, aros de avatar verificado
    primaryDark: '#1FA83D',      // Estado presionado del botón primario

    // ── Fondos ─────────────────────────────────────────────
    background: '#F5F7F5',       // Fondo general de pantallas
    surface: '#FFFFFF',          // Tarjetas, inputs, modales
    surfaceAlt: '#F0F4F0',       // Fondos alternativos (hero sections)

    // ── Texto ──────────────────────────────────────────────
    textPrimary: '#111827',      // Títulos, valores importantes
    textSecondary: '#6B7280',    // Subtítulos, descripciones
    textMuted: '#9CA3AF',        // Placeholders, timestamps, captions
    textOnPrimary: '#FFFFFF',    // Texto sobre botones verdes
    textLink: '#2DC84D',         // Links, acciones en texto ("Ver todo")
    textDanger: '#EF4444',       // "Cerrar Sesión", errores en texto

    // ── Bordes ─────────────────────────────────────────────
    border: '#E5E7EB',           // Inputs, tarjetas, separadores
    borderFocus: '#2DC84D',      // Input enfocado
    borderSelected: '#2DC84D',   // SelectableCard seleccionada
    separator: '#F3F4F6',        // Líneas divisoras internas

    // ── Estados ────────────────────────────────────────────
    success: '#2DC84D',
    successLight: '#E8F9EE',
    warning: '#F59E0B',          // PQRS pendientes, alertas de retraso
    warningLight: '#FEF3C7',
    error: '#EF4444',            // "Inactivo", acceso bloqueado
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#EFF6FF',

    // ── Categorías de Material (íconos coloreados) ─────────
    plastic: '#3B82F6',          // PET, PEAD — azul
    plasticBg: '#EFF6FF',
    cardboard: '#F59E0B',        // Cartón Corrugado — naranja
    cardboardBg: '#FEF3C7',
    glass: '#8B5CF6',            // Vidrio — morado
    glassBg: '#F5F3FF',
    metals: '#6B7280',           // Aluminio, Cobre — gris
    metalsBg: '#F3F4F6',
    organic: '#2DC84D',          // Orgánicos — verde
    organicBg: '#E8F9EE',
    paper: '#14B8A6',            // Papel Archivo — teal
    paperBg: '#F0FDFA',

    // ── Badges de Rol ──────────────────────────────────────
    badgeAdminText: '#FFFFFF',
    badgeAdminBg: '#6B7280',
    badgeRecyclerText: '#1FA83D',
    badgeRecyclerBg: '#E8F9EE',
    badgeOperarioText: '#B45309',
    badgeOperarioBg: '#FEF3C7',

    // ── Indicadores de Estado de Ruta/Pesaje ───────────────
    statusPending: '#F59E0B',
    statusPendingBg: '#FEF3C7',
    statusConfirmed: '#2DC84D',
    statusConfirmedBg: '#E8F9EE',
    statusReported: '#EF4444',
    statusReportedBg: '#FEE2E2',
    statusCompleted: '#9CA3AF',
    statusCompletedBg: '#F3F4F6',
    statusOnline: '#2DC84D',
    statusOffline: '#EF4444',

    // ── UI General ─────────────────────────────────────────
    disabled: '#D1D5DB',
    disabledText: '#9CA3AF',
    overlay: 'rgba(0, 0, 0, 0.5)',
    transparent: 'transparent',
    shadowColor: '#000000',
  },

  typography: {
    // Tamaños (en dp/sp — Expo usa unidades independientes de densidad)
    sizes: {
      display: 48,   // Lecturas de báscula "0.00", pesos grandes
      hero: 36,      // Valores hero en tarjetas verdes ("1,250 kg")
      h1: 28,        // Títulos de pantalla ("Guía de Reciclaje")
      h2: 22,        // Subtítulos de sección ("Categorías de Residuos")
      h3: 18,        // Títulos de tarjeta ("Orgánicos")
      h4: 16,        // Labels, nombres de material, texto de botón
      body: 14,      // Texto de cuerpo general
      small: 12,     // Captions, timestamps, hints
      tiny: 11,      // Labels de tabs de navegación
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,        // Padding horizontal estándar de pantalla
    xxl: 24,
    xxxl: 32,
    huge: 40,
    screen: 20,    // Margen horizontal de pantalla (del edge al contenido)
  },

  radius: {
    xs: 6,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 50,      // Botones tipo píldora (Continuar, Ingresar, etc.)
    circle: 9999,  // Avatares, badges circulares
  },

  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  sizes: {
    buttonHeight: 56,      // Alto del botón primario (píldora grande)
    buttonHeightMd: 48,    // Botón mediano
    buttonHeightSm: 40,    // Botón pequeño
    inputHeight: 52,       // Alto de inputs de texto
    tabBarHeight: 64,      // Alto del tab bar (Android)
    tabBarHeightIos: 84,   // Alto del tab bar (iOS con safe area)
    headerHeight: 56,      // Alto del header de navegación
    fabSize: 56,           // Botón de acción flotante (+)
    iconSm: 16,
    iconMd: 20,
    iconLg: 24,
    avatarSm: 36,
    avatarMd: 48,
    avatarLg: 72,
    avatarXl: 96,
    badgeHeight: 22,
    chipHeight: 32,        // Chips de filtro (Todos, Plástico, Metal...)
    categoryGridItem: 90,  // Alto de item en grilla de categorías (2 columnas)
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = keyof typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;
