import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

export default function RootHtml({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta
          name="description"
          content="ZipaRecicla: gestión digital de reciclaje, rutas, pesajes, reportes e indicadores para la ECA de Zipaquirá."
        />
        <meta name="theme-color" content="#059669" />
        <meta property="og:title" content="ZipaRecicla | Gestión ECA" />
        <meta
          property="og:description"
          content="Plataforma web y móvil para gestionar reciclaje, rutas, pesajes y reportes operativos de la ECA."
        />
        <meta property="og:type" content="website" />
        <title>ZipaRecicla | Gestión ECA</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body { background: #F3F4F6; }
              * { box-sizing: border-box; }
              button, [role="button"] { -webkit-tap-highlight-color: transparent; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
