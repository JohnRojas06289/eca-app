// ============================================================
// ZIPARECICLA — Design System Tokens
// Extraído de las 27 pantallas del diseño Figma (Marzo 2026)
// ============================================================

export const theme = {
  colors: {
    // ── Marca ──────────────────────────────────────────────
    primary: '#059669',          // Emerald 600 - Verde profundo industrial
    primaryLight: '#D1FAE5',     // Emerald 100
    primaryMid: '#34D399',       // Emerald 400
    primaryDark: '#047857',      // Emerald 700

    // ── Fondos ─────────────────────────────────────────────
    background: '#F3F4F6',       // Gray 100 - Fondo más realista y menos "maqueta"
    surface: '#FFFFFF',          // Blanco puro
    surfaceAlt: '#F1F5F9',       // Slate 100

    // ── Texto ──────────────────────────────────────────────
    textPrimary: '#0F172A',      // Slate 900 - Alta legibilidad
    textSecondary: '#475569',    // Slate 600
    textMuted: '#94A3B8',        // Slate 400
    textOnPrimary: '#FFFFFF',
    textLink: '#059669',
    textDanger: '#EF4444',

    // ── Bordes ─────────────────────────────────────────────
    border: '#E2E8F0',           // Slate 200 - Bordes definidos
    borderFocus: '#059669',
    borderSelected: '#059669',
    separator: '#F1F5F9',        // Slate 100

    // ── Estados ────────────────────────────────────────────
    success: '#10B981',          // Emerald 500
    successLight: '#D1FAE5',
    warning: '#F59E0B',          // Amber 500
    warningLight: '#FEF3C7',
    error: '#EF4444',            // Red 500
    errorLight: '#FEE2E2',
    info: '#3B82F6',             // Blue 500
    infoLight: '#EFF6FF',

    // ── Categorías de Material (íconos coloreados) ─────────
    plastic: '#3B82F6',          // PET, PEAD — azul
    plasticBg: '#EFF6FF',
    cardboard: '#F59E0B',        // Cartón Corrugado — naranja
    cardboardBg: '#FEF3C7',
    glass: '#8B5CF6',            // Vidrio — morado
    glassBg: '#F5F3FF',
    metals: '#64748B',           // Aluminio, Cobre — Slate 500
    metalsBg: '#F1F5F9',         // Slate 100
    organic: '#10B981',          // Orgánicos — Emerald 500
    organicBg: '#D1FAE5',        // Emerald 100
    paper: '#0EA5E9',            // Papel Archivo — Sky 500
    paperBg: '#E0F2FE',          // Sky 100
    rcd: '#78716C',              // RCD — Stone 500
    rcdBg: '#F5F5F4',            // Stone 100
    waste: '#334155',            // Rechazo — Slate 700
    wasteBg: '#F1F5F9',          // Slate 100

    // ── Badges de Rol ──────────────────────────────────────
    badgeAdminText: '#FFFFFF',
    badgeAdminBg: '#475569',     // Slate 600
    badgeRecyclerText: '#047857', // Emerald 700
    badgeRecyclerBg: '#D1FAE5',  // Emerald 100
    badgeOperarioText: '#B45309',
    badgeOperarioBg: '#FEF3C7',

    // ── Indicadores de Estado de Ruta/Pesaje ───────────────
    statusPending: '#F59E0B',
    statusPendingBg: '#FEF3C7',
    statusConfirmed: '#10B981',
    statusConfirmedBg: '#D1FAE5',
    statusReported: '#EF4444',
    statusReportedBg: '#FEE2E2',
    statusCompleted: '#94A3B8',
    statusCompletedBg: '#F1F5F9',
    statusOnline: '#10B981',
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
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,        // Reducimos redondeo para una apariencia más productiva
    xl: 14,
    xxl: 20,
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
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 8,
    },
  },

  sizes: {
    buttonHeight: 48,      // Altos más cercanos a patrones nativos
    buttonHeightMd: 44,
    buttonHeightSm: 38,
    inputHeight: 50,
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
