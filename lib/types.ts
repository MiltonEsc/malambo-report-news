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

export interface StatsAlertItem {
  title: string;
  link: string | null;
  barrio: string | null;
}

export interface SecurityStatsReport {
  municipio: string;
  fechaReporte: string | null;
  totalNoticias: number;
  indiceInseguridad: string | null;
  nivelAlerta: string | null;
  tiposDelito: Array<{ label: string; total: number }>;
  rankingZonas: Array<{ label: string; total: number }>;
  alertasRecientes: StatsAlertItem[];
  fuente: string | null;
}

export interface StreakHistoryItem {
  rowNumber: number | null;
  municipio: string;
  startDate: string | null;
  endDate: string | null;
  durationLabel: string | null;
  durationMs: number | null;
  eventTitle: string | null;
  url: string | null;
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
  historialRachas: StreakHistoryItem[];
  reporteEstadistico: SecurityStatsReport | null;
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
