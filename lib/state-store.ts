import { promises as fs } from "fs";
import os from "os";
import path from "path";

import { normalizeStatusPayload, normalizeStatsPayload } from "@/lib/normalizers";
import { formatDuration, isValidUrl, parseDateSafely } from "@/lib/time";
import type { StatusResponse, StreakHistoryItem } from "@/lib/types";

const DEFAULT_STATE: StatusResponse = {
  municipio: "Malambo",
  estadoActual: "sin_datos",
  nivelAlerta: "desconocida",
  ultimaFechaEventoReal: null,
  ultimoDiaEvento: null,
  ultimaFechaHallazgo: null,
  ultimaFuente: null,
  ultimoTitulo: null,
  ultimaUrl: null,
  ultimaRevision: null,
  coincidenciasRecientes: 0,
  historial: [],
  historialRachas: [],
  reporteEstadistico: null
};

interface UpdateRachaInput {
  reset: boolean;
  diasPaz: string | null;
  tituloNoticia: string | null;
  fechaNoticia: string | null;
  noticiaUrl?: string | null;
  fuente?: string | null;
}

function getStateFilePath() {
  if (process.env.MALAMBO_STATE_FILE) {
    return process.env.MALAMBO_STATE_FILE;
  }

  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "malambo-status-store.json");
  }

  return path.join(process.cwd(), "data", "malambo-status-store.json");
}

async function ensureParentDir(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function readStateFromDisk() {
  const filePath = getStateFilePath();

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const payload = JSON.parse(raw) as unknown;

    return normalizeStatusPayload(payload);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

async function writeStateToDisk(state: StatusResponse) {
  const filePath = getStateFilePath();
  await ensureParentDir(filePath);
  await fs.writeFile(filePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function bootstrapStateFromRemote() {
  const statusUrl = process.env.N8N_STATUS_URL;

  if (!statusUrl) {
    return null;
  }

  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    throw new Error(`No fue posible inicializar el estado desde n8n (${response.status}).`);
  }

  const payload: unknown = await response.json();
  const state = normalizeStatusPayload(payload);
  await writeStateToDisk(state);

  return state;
}

export async function getStoredStatus() {
  const stored = await readStateFromDisk();

  if (stored) {
    return stored;
  }

  try {
    const bootstrapped = await bootstrapStateFromRemote();

    if (bootstrapped) {
      return bootstrapped;
    }
  } catch {
    // Si la inicializacion remota falla, devolvemos un estado vacio utilizable.
  }

  return DEFAULT_STATE;
}

export async function getStoredStats() {
  const statsUrl = process.env.N8N_STATS_URL;

  if (!statsUrl) {
    return null;
  }

  const response = await fetch(statsUrl, {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    return null;
  }

  const payload: unknown = await response.json();
  return normalizeStatsPayload(payload);
}

function buildHistoryItem(
  previousStartDate: string,
  endDate: string,
  eventTitle: string | null,
  durationLabel: string | null,
  currentLength: number,
  url: string | null
): StreakHistoryItem {
  const startTime = parseDateSafely(previousStartDate)?.getTime() ?? 0;
  const endTime = parseDateSafely(endDate)?.getTime() ?? 0;
  const fallbackDuration = endTime > startTime ? formatDuration(endTime - startTime) : null;

  return {
    rowNumber: currentLength + 1,
    municipio: "Malambo",
    startDate: previousStartDate,
    endDate,
    durationLabel: durationLabel ?? fallbackDuration,
    durationMs: endTime > startTime ? endTime - startTime : null,
    eventTitle,
    url
  };
}

export async function updateStoredRacha(input: UpdateRachaInput) {
  if (!input.reset) {
    throw new Error("El parametro reset=true es obligatorio para reiniciar la racha.");
  }

  const now = new Date();
  const eventDate = input.fechaNoticia ? parseDateSafely(input.fechaNoticia) : now;

  if (!eventDate) {
    throw new Error("fecha_noticia no es una fecha valida.");
  }

  const state = await getStoredStatus();
  const previousStartDate = state.ultimaFechaEventoReal;
  const normalizedEventDate = eventDate.toISOString();
  const normalizedUrl = isValidUrl(input.noticiaUrl) ? (input.noticiaUrl ?? null) : null;
  const headline = input.tituloNoticia?.trim() || "Nuevo homicidio detectado";
  const source = input.fuente?.trim() || state.ultimaFuente || "n8n webhook";

  const historialRachas =
    previousStartDate && previousStartDate !== normalizedEventDate
      ? [
          buildHistoryItem(
            previousStartDate,
            normalizedEventDate,
            headline,
            input.diasPaz,
            state.historialRachas.length,
            normalizedUrl
          ),
          ...state.historialRachas
        ]
      : state.historialRachas;

  const historial = [
    {
      title: headline,
      source,
      link: normalizedUrl,
      pubDate: normalizedEventDate,
      tipoEvento: "homicidio",
      trusted: true
    },
    ...state.historial
  ].slice(0, 25);

  const updatedState: StatusResponse = {
    ...state,
    municipio: "Malambo",
    estadoActual: "con_reportes_recientes",
    nivelAlerta: "alta",
    ultimaFechaEventoReal: normalizedEventDate,
    ultimoDiaEvento: normalizedEventDate.slice(0, 10),
    ultimaFechaHallazgo: now.toISOString(),
    ultimaFuente: source,
    ultimoTitulo: headline,
    ultimaUrl: normalizedUrl,
    ultimaRevision: now.toISOString(),
    coincidenciasRecientes: Math.max(1, state.coincidenciasRecientes),
    historial,
    historialRachas
  };

  await writeStateToDisk(updatedState);

  return updatedState;
}
