# Malambo Status

Aplicacion publica construida con Next.js 14, App Router y TypeScript para mostrar el tiempo transcurrido desde el ultimo homicidio, atentado o intento de homicidio reciente detectado por una automatizacion en n8n.

## Caracteristicas

- Proxy interno en `/api/status` para ocultar el webhook de n8n al cliente.
- Contador en vivo que se actualiza cada segundo usando `ultima_fecha_evento_real`.
- Refresco automatico del estado cada 60 segundos sin recargar la pagina.
- Normalizacion defensiva de datos incompletos o nulos.
- Formateo de duracion y fechas en espanol.
- Diseno responsive, sobrio y listo para desplegar en Vercel.
- Tipado fuerte con TypeScript y sin dependencias innecesarias.

## Estructura principal

```text
app/
  api/status/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  HomeDashboard.tsx
  ReportsList.tsx
  StatusPanel.tsx
  TimerCard.tsx
lib/
  normalizers.ts
  time.ts
  types.ts
```

## Requisitos

- Node.js 18.17 o superior
- npm 9 o superior

## Como correrlo localmente

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno:

```bash
cp .env.example .env.local
```

En Windows PowerShell tambien puedes hacerlo asi:

```powershell
Copy-Item .env.example .env.local
```

3. Edita `.env.local` y define la URL del webhook de n8n:

```env
N8N_STATUS_URL=https://tu-instancia-n8n.com/webhook/estado-malambo
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000).

## Como conectar la URL de n8n

La app nunca consulta n8n directamente desde el navegador. El flujo es:

1. El cliente llama a `/api/status`.
2. La ruta API lee `N8N_STATUS_URL` desde variables de entorno.
3. El servidor Next.js hace `fetch` al webhook de n8n.
4. La respuesta se normaliza y se devuelve al cliente como JSON estable.

Eso permite cambiar la URL real del webhook sin tocar el frontend y evita exponerla publicamente en el navegador.

## Formato esperado del webhook

El normalizador soporta campos faltantes, pero el contrato recomendado es:

```json
{
  "municipio": "Malambo",
  "estado_actual": "con_reportes_recientes",
  "nivel_alerta": "alta",
  "ultima_fecha_evento_real": "2026-03-28T14:03:09.000Z",
  "ultimo_dia_evento": "2026-03-28",
  "ultima_fecha_hallazgo": "2026-03-28T14:03:09.000Z",
  "ultima_fuente": "impactonews.co",
  "ultimo_titulo": "Hombre permanece en estado critico tras sufrir atentado en Malambo",
  "ultima_url": "https://...",
  "ultima_revision": "2026-03-28T15:00:00.000Z",
  "coincidencias_recientes": 3,
  "historial": [
    {
      "title": "Hombre permanece en estado critico tras sufrir atentado en Malambo",
      "source": "impactonews.co",
      "link": "https://...",
      "pubDate": "Fri, 27 Mar 2026 14:03:09 GMT",
      "tipo_evento": "atentado",
      "trusted": true
    }
  ]
}
```

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Despliegue en Vercel

1. Sube este proyecto a un repositorio Git.
2. Entra a Vercel y crea un proyecto nuevo importando ese repositorio.
3. Vercel detectara automaticamente Next.js.
4. En la configuracion del proyecto, agrega la variable de entorno:

```env
N8N_STATUS_URL=https://tu-instancia-n8n.com/webhook/estado-malambo
```

5. Despliega el proyecto.

No necesitas base de datos ni autenticacion para este caso.

## Como cambiar luego el dominio

1. Abre tu proyecto en Vercel.
2. Ve a `Settings`.
3. Entra a `Domains`.
4. Agrega tu nuevo dominio o subdominio.
5. Configura los registros DNS que Vercel te indique.
6. Cuando el dominio quede verificado, marcalo como principal si quieres que sea el dominio publico por defecto.

Cambiar el dominio no requiere modificar codigo. Solo debes asegurarte de que el nuevo dominio este asociado al proyecto correcto en Vercel.

## Notas de produccion

- La ruta `/api/status` usa `cache: "no-store"` para evitar respuestas obsoletas.
- El contador se recalcula cada segundo en el cliente.
- Si `ultima_fecha_evento_real` no existe o no es una fecha valida, la interfaz muestra `Sin eventos recientes`.
- Si el refresco automatico falla, la UI conserva el ultimo dato valido y muestra una advertencia no intrusiva.
