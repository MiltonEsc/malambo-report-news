import type {
  AlertLevel,
  CurrentState,
  ReportItem,
  SecurityStatsReport,
  StatsAlertItem,
  StatusResponse
} from "@/lib/types";
import { isValidUrl, parseDateSafely } from "@/lib/time";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function normalizeAlertLevel(value: unknown): AlertLevel {
  if (value === "alta" || value === "media" || value === "baja") {
    return value;
  }

  return "desconocida";
}

function normalizeCurrentState(value: unknown): CurrentState {
  if (
    value === "con_reportes_recientes" ||
    value === "sin_reportes_recientes" ||
    value === "sin_datos"
  ) {
    return value;
  }

  return "desconocido";
}

function normalizeIsoDate(value: unknown): string | null {
  const stringValue = asString(value);
  const parsed = parseDateSafely(stringValue);

  return parsed ? parsed.toISOString() : null;
}

function normalizeReportItem(value: unknown): ReportItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const title = asString(record.title) ?? "Reporte sin titular";
  const source = asString(record.source);
  const link = isValidUrl(record.link as string | null | undefined)
    ? (record.link as string)
    : null;

  return {
    title,
    source,
    link,
    pubDate: normalizeIsoDate(record.pubDate),
    tipoEvento: asString(record.tipo_evento),
    trusted: record.trusted === true
  };
}

function normalizeLabeledTotals(value: unknown): Array<{ label: string; total: number }> {
  const record = asRecord(value);

  return Object.entries(record)
    .map(([label, total]) => ({
      label,
      total: asNumber(total)
    }))
    .filter((item) => item.label.trim().length > 0)
    .sort((a, b) => b.total - a.total);
}

function normalizeStatsAlertItem(value: unknown): StatsAlertItem | null {
  const record = asRecord(value);
  const title = asString(record.t);

  if (!title) {
    return null;
  }

  const linkValue = asString(record.l);

  return {
    title,
    link: isValidUrl(linkValue) ? linkValue : null,
    barrio: asString(record.b)
  };
}

export function normalizeStatsPayload(payload: unknown): SecurityStatsReport | null {
  const record = asRecord(payload);

  if (!Object.keys(record).length) {
    return null;
  }

  const alertasRaw = Array.isArray(record.alertas_recientes) ? record.alertas_recientes : [];
  const alertasRecientes = alertasRaw
    .map((item) => normalizeStatsAlertItem(item))
    .filter((item): item is StatsAlertItem => item !== null);
  const detalle = asRecord(record.analisis_detallado);

  return {
    municipio: asString(record.municipio) ?? "Malambo",
    fechaReporte: normalizeIsoDate(record.fecha_reporte),
    totalNoticias: asNumber(record.total_noticias),
    indiceInseguridad: asString(record.indice_inseguridad),
    nivelAlerta: asString(record.nivel_alerta),
    tiposDelito: normalizeLabeledTotals(detalle.tipos_delito),
    rankingZonas: normalizeLabeledTotals(detalle.ranking_zonas),
    alertasRecientes,
    fuente: asString(record.fuente)
  };
}

export function normalizeStatusPayload(payload: unknown): StatusResponse {
  const record = asRecord(payload);
  const historialRaw = Array.isArray(record.historial) ? record.historial : [];
  const historial = historialRaw
    .map((item) => normalizeReportItem(item))
    .filter((item): item is ReportItem => item !== null);

  const ultimaUrlValue = asString(record.ultima_url);

  return {
    municipio: asString(record.municipio) ?? "Malambo",
    estadoActual: normalizeCurrentState(record.estado_actual),
    nivelAlerta: normalizeAlertLevel(record.nivel_alerta),
    ultimaFechaEventoReal: normalizeIsoDate(record.ultima_fecha_evento_real),
    ultimoDiaEvento: asString(record.ultimo_dia_evento),
    ultimaFechaHallazgo: normalizeIsoDate(record.ultima_fecha_hallazgo),
    ultimaFuente: asString(record.ultima_fuente),
    ultimoTitulo: asString(record.ultimo_titulo),
    ultimaUrl: isValidUrl(ultimaUrlValue) ? ultimaUrlValue : null,
    ultimaRevision: normalizeIsoDate(record.ultima_revision),
    coincidenciasRecientes: asNumber(record.coincidencias_recientes),
    historial,
    reporteEstadistico: null
  };
}
