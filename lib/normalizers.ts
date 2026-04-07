import type {
  AlertLevel,
  CurrentState,
  ReportItem,
  SecurityStatsReport,
  StatsAlertItem,
  StatusResponse,
  StreakHistoryItem
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

function pickFirst(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  return undefined;
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

function parseDurationToMs(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();
  const days = /(\d+)\s*d/.exec(normalized);
  const hours = /(\d+)\s*h/.exec(normalized);
  const minutes = /(\d+)\s*m/.exec(normalized);
  const seconds = /(\d+)\s*s/.exec(normalized);

  const totalMs =
    (days ? Number(days[1]) : 0) * 24 * 60 * 60 * 1000 +
    (hours ? Number(hours[1]) : 0) * 60 * 60 * 1000 +
    (minutes ? Number(minutes[1]) : 0) * 60 * 1000 +
    (seconds ? Number(seconds[1]) : 0) * 1000;

  return totalMs > 0 ? totalMs : null;
}

function normalizeStreakHistoryItem(value: unknown): StreakHistoryItem | null {
  const record = asRecord(value);
  const rowNumberValue = pickFirst(record, ["row_number", "Row Number"]);
  const durationLabel = asString(pickFirst(record, ["Duracion", "Duración", "DuraciÃ³n"]));
  const startDate = normalizeIsoDate(
    pickFirst(record, ["Fecha Inicio Racha", "fecha_inicio_racha", "start_date"])
  );
  const endDate = normalizeIsoDate(
    pickFirst(record, ["Fecha Fin Racha", "fecha_fin_racha", "end_date"])
  );
  const eventTitle = asString(
    pickFirst(record, [
      "Titulo del Evento",
      "Título del Evento",
      "TÃ­tulo del Evento",
      "event_title"
    ])
  );
  const urlValue = asString(pickFirst(record, ["URL", "url"]));

  if (!startDate && !endDate && !durationLabel && !eventTitle && !urlValue) {
    return null;
  }

  return {
    rowNumber:
      typeof rowNumberValue === "number" && Number.isFinite(rowNumberValue) ? rowNumberValue : null,
    municipio: asString(pickFirst(record, ["Municipio", "municipio"])) ?? "Malambo",
    startDate,
    endDate,
    durationLabel,
    durationMs: parseDurationToMs(durationLabel),
    eventTitle,
    url: isValidUrl(urlValue) ? urlValue : null
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
  const historialRachasRaw = Array.isArray(record.historial_rachas) ? record.historial_rachas : [];
  const historial = historialRaw
    .map((item) => normalizeReportItem(item))
    .filter((item): item is ReportItem => item !== null);
  const historialRachas = historialRachasRaw
    .map((item) => normalizeStreakHistoryItem(item))
    .filter((item): item is StreakHistoryItem => item !== null);

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
    historialRachas,
    reporteEstadistico: null
  };
}
