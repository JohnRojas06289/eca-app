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
TURSO_DATABASE_URL="libsql://tu-db.turso.io"
TURSO_AUTH_TOKEN="tu_token_turso"
AUTH_TOKEN_SECRET="cambia-esta-clave-para-firmar-tokens"
```

Levanta el backend:

```bash
cd backend
npm run dev
```

El backend crea automáticamente las tablas necesarias en Turso para:
- historial del chatbot
- usuarios de autenticación

Puedes validar la conexión con:

```bash
curl http://localhost:4000/health
curl http://localhost:4000/health/db
npm --prefix backend run check:db
```

Para crear un usuario administrativo manualmente:

```bash
npm --prefix backend run seed:admin -- --name="Admin ECA" --email="admin@eca.com" --password="Password1" --phone="3001234567"
```

---

## Correr la app

```bash
npx expo start
```

Se abrirá el Metro Bundler en la terminal. Escanea el código QR con **Expo Go** en tu celular (debe estar en la misma red Wi-Fi que el computador).

---

## Credenciales de prueba / autenticación

Mientras `EXPO_PUBLIC_USE_DEMO_AUTH=true`, el frontend puede seguir usando accesos rápidos demo.
Si desactivas el demo auth y apuntas a la API real, los usuarios nuevos se crean desde el registro web/móvil con contraseña propia.

| Rol           | Correo de ejemplo         | Contraseña |
|---------------|---------------------------|------------|
| Administrador | `admin@empresa.com`       | Demo / seed manual |
| Reciclador    | Registro propio           | La que defina el usuario |
| Supervisor    | `supervisor@empresa.com`  | Demo / seed manual |
| Ciudadano     | Registro propio           | La que defina el usuario |

> Hoy el registro real crea cuentas para **ciudadano** y **reciclador**.  
> Los roles **admin** y **supervisor** siguen dependiendo de demo auth o de cargarlos manualmente en la BD.

---

## Asistente IA (Chatbot)

La app incluye un chatbot flotante accesible desde cualquier pantalla autenticada.
Ahora consume el endpoint backend `POST /api/chat`, donde se usa Gemini y se persiste historial por conversación en Turso.

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
