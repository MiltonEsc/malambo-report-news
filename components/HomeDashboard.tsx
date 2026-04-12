"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/HomeDashboard.module.css";
import { ReportsList } from "@/components/ReportsList";
import { StatsPanel } from "@/components/StatsPanel";
import { StatusPanel } from "@/components/StatusPanel";
import { StreakHistoryTable } from "@/components/StreakHistoryTable";
import { TimerCard } from "@/components/TimerCard";
import { parseDateSafely } from "@/lib/time";
import type {
  StatusApiResponse,
  StatusApiSuccess,
  StatusResponse,
  StreakHistoryItem
} from "@/lib/types";

const REFRESH_INTERVAL_MS = 60_000;

interface DashboardState {
  loading: boolean;
  error: string | null;
  data: StatusResponse | null;
  fetchedAt: string | null;
}

async function fetchStatus(signal?: AbortSignal): Promise<StatusApiSuccess> {
  const response = await fetch("/api/status", {
    method: "GET",
    headers: {
      Accept: "application/json"
    },
    cache: "no-store",
    signal
  });

  const payload = (await response.json()) as StatusApiResponse;

  if (!response.ok) {
    throw new Error(payload.ok ? "No fue posible cargar el estado." : payload.error);
  }

  if (!payload.ok) {
    throw new Error(payload.error);
  }

  return payload;
}

export function HomeDashboard() {
  const [state, setState] = useState<DashboardState>({
    loading: true,
    error: null,
    data: null,
    fetchedAt: null
  });

  useEffect(() => {
    let mounted = true;
    let activeController: AbortController | null = null;

    const loadStatus = async () => {
      activeController?.abort();
      const controller = new AbortController();
      activeController = controller;

      try {
        const payload = await fetchStatus(controller.signal);

        if (!mounted) {
          return;
        }

        setState({
          loading: false,
          error: null,
          data: payload.data,
          fetchedAt: payload.fetchedAt
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        setState((current) => ({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Ocurrio un error inesperado al consultar el estado.",
          data: current.data,
          fetchedAt: current.fetchedAt
        }));
      }
    };

    void loadStatus();

    const intervalId = window.setInterval(() => {
      void loadStatus();
    }, REFRESH_INTERVAL_MS);

    return () => {
      mounted = false;
      activeController?.abort();
      window.clearInterval(intervalId);
    };
  }, []);

  const effectiveEventDate = useMemo(() => {
    if (!state.data) {
      return null;
    }

    const now = Date.now();
    const baseEventDate = state.data.ultimaFechaEventoReal;
    const latestStreakEndDate = state.data.historialRachas.reduce<string | null>((latest, streak) => {
      if (!streak.endDate) {
        return latest;
      }

      const candidateTime = parseDateSafely(streak.endDate)?.getTime();

      if (!candidateTime || candidateTime > now) {
        return latest;
      }

      if (!latest) {
        return streak.endDate;
      }

      const latestTime = parseDateSafely(latest)?.getTime() ?? 0;

      return candidateTime > latestTime ? streak.endDate : latest;
    }, null);

    if (!baseEventDate) {
      return latestStreakEndDate;
    }

    const baseTime = parseDateSafely(baseEventDate)?.getTime();

    if (!baseTime || baseTime > now) {
      return latestStreakEndDate;
    }

    if (!latestStreakEndDate) {
      return baseEventDate;
    }

    const streakTime = parseDateSafely(latestStreakEndDate)?.getTime() ?? 0;

    return streakTime > baseTime ? latestStreakEndDate : baseEventDate;
  }, [state.data]);

  const effectiveLatestEvent = useMemo(() => {
    if (!state.data) {
      return null;
    }

    const now = Date.now();

    return state.data.historialRachas.reduce<StreakHistoryItem | null>(
      (latest, streak) => {
        if (!streak.endDate || !streak.eventTitle) {
          return latest;
        }

        const candidateTime = parseDateSafely(streak.endDate)?.getTime();

        if (!candidateTime || candidateTime > now) {
          return latest;
        }

        if (!latest) {
          return streak;
        }

        const latestTime = parseDateSafely(latest.endDate)?.getTime() ?? 0;

        return candidateTime > latestTime ? streak : latest;
      },
      null
    );
  }, [state.data]);

  const effectiveHeadline = effectiveLatestEvent?.eventTitle ?? state.data?.ultimoTitulo ?? null;
  const effectiveUrl = effectiveLatestEvent?.url ?? state.data?.ultimaUrl ?? null;
  const effectiveSource = useMemo(() => {
    if (effectiveLatestEvent?.eventTitle) {
      const parts = effectiveLatestEvent.eventTitle.split(" - ").map((part) => part.trim());
      const lastPart = parts.at(-1);

      if (lastPart) {
        return lastPart;
      }
    }

    return state.data?.ultimaFuente ?? null;
  }, [effectiveLatestEvent, state.data?.ultimaFuente]);

  const hasEventDate = Boolean(effectiveEventDate);

  return (
    <main className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.brand}>Sentinel Monitor</span>
        <span className={styles.topbarNote}>Panel publico de seguimiento automatizado</span>
      </header>

      <div className={styles.hero}>
        {state.loading && !state.data ? (
          <section className={styles.notice} aria-live="polite">
            <h1 className={styles.noticeTitle}>Cargando estado actual</h1>
            <p className={styles.noticeText}>
              Estamos consultando el ultimo evento detectado por la automatizacion.
            </p>
          </section>
        ) : null}

        {state.error && !state.data ? (
          <section className={styles.notice} aria-live="assertive">
            <h1 className={styles.noticeTitle}>No fue posible cargar la informacion</h1>
            <p className={styles.noticeText}>{state.error}</p>
          </section>
        ) : null}

        {!state.loading && !state.error && !state.data ? (
          <section className={styles.notice}>
            <h1 className={styles.noticeTitle}>Sin datos disponibles</h1>
            <p className={styles.noticeText}>
              El endpoint interno respondio sin contenido utilizable.
            </p>
          </section>
        ) : null}

        {state.data ? (
          <>
            <section className={styles.heroSection}>
              <TimerCard
                municipality={state.data.municipio}
                eventDate={effectiveEventDate}
                foundDate={state.data.ultimaFechaHallazgo}
                streakHistory={state.data.historialRachas}
              />
            </section>

            <section className={styles.asymmetricGrid} aria-label="Detalle del monitoreo">
              <div className={styles.sidebar}>
                <StatusPanel
                  status={state.data}
                  fetchedAt={state.fetchedAt ?? new Date().toISOString()}
                  effectiveHeadline={effectiveHeadline}
                  effectiveUrl={effectiveUrl}
                  effectiveSource={effectiveSource}
                />

                {!hasEventDate ? (
                  <section className={styles.notice}>
                    <h2 className={styles.noticeTitle}>Contador en pausa</h2>
                    <p className={styles.noticeText}>
                      El webhook no reporta una fecha valida en
                      <code className={styles.inlineCode}>ultima_fecha_evento_real</code>, por lo
                      que el contador permanece desactivado hasta recibir un nuevo evento.
                    </p>
                  </section>
                ) : null}

                {state.error ? (
                  <section className={styles.notice} aria-live="polite">
                    <h2 className={styles.noticeTitle}>Actualizacion con advertencia</h2>
                    <p className={styles.noticeText}>
                      Se conserva el dato mas reciente cargado correctamente, pero el refresco
                      automatico reporto este problema: {state.error}
                    </p>
                  </section>
                ) : null}
              </div>

              <div className={styles.mainColumn}>
                {state.data.reporteEstadistico ? (
                  <StatsPanel report={state.data.reporteEstadistico} />
                ) : (
                  <section className={styles.notice}>
                    <h2 className={styles.noticeTitle}>Reporte estadistico no disponible</h2>
                    <p className={styles.noticeText}>
                      La automatizacion aun no entrego un resumen agregado para este corte.
                    </p>
                  </section>
                )}
              </div>
            </section>

            <section className={styles.bottomSection}>
              <StreakHistoryTable streaks={state.data.historialRachas} />
              <ReportsList reports={state.data.historial} />
            </section>
          </>
        ) : null}

        <footer className={styles.footer}>
          Panel publico informativo. Verifica siempre las fuentes originales enlazadas para mayor
          contexto. Actualizacion automatica cada 1 minuto.
        </footer>
      </div>
    </main>
  );
}
