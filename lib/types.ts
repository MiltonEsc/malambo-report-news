export type AlertLevel = "alta" | "media" | "baja" | "desconocida";

export type CurrentState =
  | "con_reportes_recientes"
  | "sin_reportes_recientes"
  | "sin_datos"
  | "desconocido";

export interface ReportItem {
  title: string;
  source: string | null;
  link: string | null;
  pubDate: string | null;
  tipoEvento: string | null;
  trusted: boolean;
}

export interface StatusResponse {
  municipio: string;
  estadoActual: CurrentState;
  nivelAlerta: AlertLevel;
  ultimaFechaEventoReal: string | null;
  ultimoDiaEvento: string | null;
  ultimaFechaHallazgo: string | null;
  ultimaFuente: string | null;
  ultimoTitulo: string | null;
  ultimaUrl: string | null;
  ultimaRevision: string | null;
  coincidenciasRecientes: number;
  historial: ReportItem[];
}

export interface StatusApiSuccess {
  ok: true;
  data: StatusResponse;
  fetchedAt: string;
}

export interface StatusApiError {
  ok: false;
  error: string;
  fetchedAt: string;
}

export type StatusApiResponse = StatusApiSuccess | StatusApiError;
