# ECA App — Estación de Clasificación y Aprovechamiento

Aplicación móvil para la gestión operativa de una ECA (Estación de Clasificación y Aprovechamiento de Residuos Sólidos) en Colombia. Desarrollada con React Native + Expo, soporta cuatro roles de usuario con flujos independientes y un asistente de IA integrado.

---

## Roles y accesos

| Rol           | Acceso                                                                 |
|---------------|------------------------------------------------------------------------|
| Administrador | Registrar pesajes, validar, reportes compra/venta, usuarios, ajustes   |
| Reciclador    | Confirmar pesajes asignados, historial, rutas, perfil                  |
| Supervisor    | Dashboard de KPIs y comparativo compras/ventas (solo lectura)          |
| Ciudadano     | Portal informativo, rutas de recolección, historial, PQRS, perfil      |

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) instalado en tu celular (Android o iOS)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/eca-app.git
cd eca-app

# 2. Instalar dependencias
npm install --legacy-peer-deps
```

---

## Variables de entorno (app móvil)

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_API_BASE_URL="http://TU_IP_LOCAL:4000"
```

> En Android emulador usa `http://10.0.2.2:4000`.

---

## Backend IA + Base de datos (Gemini seguro)

La key de Gemini ahora se configura en el backend (no en la app móvil).

```bash
cd backend
npm install
cp .env.example .env
```

En `backend/.env` configura:

```env
PORT=4000
GEMINI_API_KEY="tu_api_key_real"
GEMINI_MODEL="gemini-2.5-flash"
CHAT_DB_PATH="./data/chat.db"
```

Levanta el backend:

```bash
cd backend
npm run dev
```

La BD SQLite se crea automáticamente en `backend/data/chat.db`.

---

## Correr la app

```bash
npx expo start
```

Se abrirá el Metro Bundler en la terminal. Escanea el código QR con **Expo Go** en tu celular (debe estar en la misma red Wi-Fi que el computador).

---

## Credenciales de prueba

El rol se determina automáticamente por el prefijo del correo. La contraseña puede ser cualquier texto.

| Rol           | Correo de ejemplo         | Contraseña |
|---------------|---------------------------|------------|
| Administrador | `admin@empresa.com`       | cualquiera |
| Reciclador    | `recycler@empresa.com`    | cualquiera |
| Supervisor    | `supervisor@empresa.com`  | cualquiera |
| Ciudadano     | `usuario@gmail.com`       | cualquiera |

---

## Asistente IA (Chatbot)

La app incluye un chatbot flotante accesible desde cualquier pantalla autenticada.
Ahora consume el endpoint backend `POST /api/chat`, donde se usa Gemini y se persiste historial por conversación en SQLite.

---

## Estructura del proyecto

```
eca-app/
├── app/
│   ├── (auth)/          # Login, registro, recuperar contraseña
│   ├── (citizen)/       # Portal ciudadano (inicio, rutas, pesajes, perfil, PQRS, etc.)
│   ├── (recycler)/      # Panel reciclador (inicio, validar pesajes, rutas, perfil)
│   ├── (admin)/         # Panel admin (dashboard, pesajes, reportes, usuarios, ajustes)
│   ├── (supervisor)/    # Panel supervisor (KPIs, comparativo compras/ventas)
│   └── _layout.tsx      # AuthProvider + guard de autenticación y redirección por rol
├── src/
│   ├── components/      # ChatBot y componentes reutilizables
│   ├── context/         # AuthContext — sesión global
│   ├── hooks/           # useAuth
│   └── theme/           # Design tokens (colores, tipografía, espaciados, sombras)
├── assets/              # Logo y recursos gráficos
├── .env                 # API keys (no se sube al repositorio)
├── app.json             # Configuración de Expo
└── package.json
```

---

## Dependencias principales

| Paquete | Uso |
|---|---|
| `expo-router` | Navegación basada en archivos |
| `@expo/vector-icons` | Íconos (Ionicons) |
| `react-native-safe-area-context` | Áreas seguras en iOS/Android |
| `@react-native-async-storage/async-storage` | Persistencia de sesión |

---

## Conectar a una API real

Busca los comentarios `⚠️ Reemplazar` en el código para identificar todos los puntos donde se usan datos simulados:

```bash
grep -r "Reemplazar" app/ src/
```

Cada comentario indica qué llamada de API debe reemplazar el mock actual.
