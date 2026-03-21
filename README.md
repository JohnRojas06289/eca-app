# ZipaRecicla — ECA Zipaquirá

Aplicación móvil para la Estación de Clasificación y Aprovechamiento (ECA) de residuos sólidos del municipio de Zipaquirá. Gestiona tres roles: **Ciudadano**, **Reciclador** y **Administrador**.

---

## Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/go) instalado en tu celular (Android o iOS)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/ECA.git
cd ECA

# 2. Instalar dependencias
npm install --legacy-peer-deps
```

---

## Correr la app

```bash
npx expo start
```

Se abrirá el Metro Bundler en la terminal. Escanea el código QR con la app **Expo Go** en tu celular (debe estar en la misma red Wi-Fi que el computador).

---

## Credenciales de prueba

La app inicia sesión automáticamente como Administrador. Para probar otros roles, cierra sesión y usa:

| Rol           | Cédula       | Contraseña        |
|---------------|--------------|-------------------|
| Administrador | `9000000001` | cualquiera ≥6 chars |
| Reciclador    | `8000000001` | cualquiera ≥6 chars |
| Ciudadano     | `1000000001` | cualquiera ≥6 chars |

> El rol se determina por el primer dígito de la cédula: `9` → Admin, `8` → Reciclador, otro → Ciudadano.

---

## Estructura del proyecto

```
eca-app/
├── app/
│   ├── (auth)/          # Pantallas de autenticación (login, registro, recuperar contraseña)
│   ├── (citizen)/       # Portal del ciudadano (9 pantallas)
│   ├── (recycler)/      # Panel del reciclador (9 pantallas)
│   ├── (admin)/         # Panel administrativo (8 pantallas)
│   └── _layout.tsx      # Guard de autenticación y redirección por rol
├── src/
│   ├── components/      # Componentes reutilizables (CustomButton, CustomInput, StatCard, etc.)
│   ├── hooks/           # useAuth — manejo de sesión con AsyncStorage
│   └── theme/           # Design tokens (colores, tipografía, espaciados, radios, sombras)
├── assets/              # Íconos y splash screen
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

Cada uno indica qué llamada de API debe reemplazar el mock actual.
