"use client";

import { useEffect, useState } from "react";

import styles from "@/components/HomeDashboard.module.css";
import { ReportsList } from "@/components/ReportsList";
import { StatusPanel } from "@/components/StatusPanel";
import { TimerCard } from "@/components/TimerCard";
import type { StatusApiResponse, StatusApiSuccess, StatusResponse } from "@/lib/types";

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

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
              : "Ocurrió un error inesperado al consultar el estado.",
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

  const hasEventDate = Boolean(state.data?.ultimaFechaEventoReal);

  return (
    <main className={styles.shell}>
      <div className={styles.hero}>
        {state.loading && !state.data ? (
          <section className={styles.notice} aria-live="polite">
            <h1 className={styles.noticeTitle}>Cargando estado actual</h1>
            <p className={styles.noticeText}>
              Estamos consultando el último evento detectado por la automatización.
            </p>
          </section>
        ) : null}

        {state.error && !state.data ? (
          <section className={styles.notice} aria-live="assertive">
            <h1 className={styles.noticeTitle}>No fue posible cargar la información</h1>
            <p className={styles.noticeText}>{state.error}</p>
          </section>
        ) : null}

        {!state.loading && !state.error && !state.data ? (
          <section className={styles.notice}>
            <h1 className={styles.noticeTitle}>Sin datos disponibles</h1>
            <p className={styles.noticeText}>
              El endpoint interno respondió sin contenido utilizable.
            </p>
          </section>
        ) : null}

        {state.data ? (
          <>
            <TimerCard
              municipality={state.data.municipio}
              eventDate={state.data.ultimaFechaEventoReal}
              foundDate={state.data.ultimaFechaHallazgo}
            />

            <p className={styles.intro}>
              Este panel consulta un proxy interno cada 1 hora para actualizar el estado
              público.
            </p>

            <section className={styles.grid} aria-label="Detalle del monitoreo">
              <div className={styles.stack}>
                <StatusPanel status={state.data} fetchedAt={state.fetchedAt ?? new Date().toISOString()} />
              </div>

              <div className={styles.stack}>
                <ReportsList reports={state.data.historial} />

                {!hasEventDate ? (
                  <section className={styles.notice}>
                    <h2 className={styles.noticeTitle}>Sin eventos recientes</h2>
                    <p className={styles.noticeText}>
                      El webhook no reporta una fecha válida en <code>ultima_fecha_evento_real</code>,
                      por lo que el contador permanece desactivado hasta recibir un nuevo evento.
                    </p>
                  </section>
                ) : null}

                {state.error ? (
                  <section className={styles.notice} aria-live="polite">
                    <h2 className={styles.noticeTitle}>Última actualización con advertencia</h2>
                    <p className={styles.noticeText}>
                      Se conserva el dato más reciente cargado correctamente, pero el refresco
                      automático reportó este problema: {state.error}
                    </p>
                  </section>
                ) : null}
              </div>
            </section>
          </>
        ) : null}

        <footer className={styles.footer}>
          Panel público informativo. Verifica siempre las fuentes originales enlazadas para mayor
          contexto.
        </footer>
      </div>
    </main>
  );
}

