import styles from "@/components/StatusPanel.module.css";
import type { AlertLevel, StatusResponse } from "@/lib/types";
import { formatSpanishDate } from "@/lib/time";

const ALERT_LABELS: Record<AlertLevel, string> = {
  alta: "Alerta alta",
  media: "Alerta media",
  baja: "Alerta baja",
  desconocida: "Alerta sin clasificar"
};

interface StatusPanelProps {
  status: StatusResponse;
  fetchedAt: string;
  effectiveHeadline?: string | null;
  effectiveUrl?: string | null;
  effectiveSource?: string | null;
}

export function StatusPanel({
  status,
  fetchedAt,
  effectiveHeadline,
  effectiveUrl,
  effectiveSource
}: StatusPanelProps) {
  const alertClassName = styles[status.nivelAlerta] ?? styles.desconocida;
  const latestSourceLabel = effectiveSource ?? status.ultimaFuente ?? "Fuente no disponible";
  const latestHeadline = effectiveHeadline ?? status.ultimoTitulo ?? "Sin titular disponible";
  const latestUrl = effectiveUrl ?? status.ultimaUrl;

  return (
    <section className={styles.panel} aria-labelledby="status-panel-title">
      <div className={styles.header}>
        <h2 id="status-panel-title" className={styles.title}>
          Estado actual
        </h2>
        <span className={`${styles.badge} ${alertClassName}`}>{ALERT_LABELS[status.nivelAlerta]}</span>
      </div>

      <div className={styles.cards}>
        <article className={styles.item}>
          <p className={styles.label}>Ultima revision automatica</p>
          <p className={styles.value}>{formatSpanishDate(status.ultimaRevision)}</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Ultima sincronizacion del panel</p>
          <p className={styles.value}>{formatSpanishDate(fetchedAt)}</p>
        </article>
      </div>

      <article className={styles.heroCard}>
        <div className={styles.heroMeta}>
          <span className={styles.heroLabel}>Titular reciente</span>
          <span className={styles.heroTag}>{status.estadoActual.replaceAll("_", " ")}</span>
        </div>
        <p className={styles.heroHeadline}>{latestHeadline}</p>
        <div className={styles.heroFooter}>
          {latestUrl ? (
            <a className={styles.heroLink} href={latestUrl} target="_blank" rel="noreferrer">
              {latestSourceLabel}
            </a>
          ) : (
            <span className={styles.heroSource}>{latestSourceLabel}</span>
          )}
          <span className={styles.heroSource}>
            {status.coincidenciasRecientes} coincidencias recientes aceptadas
          </span>
        </div>
      </article>

      <div className={styles.grid}>
        <article className={styles.item}>
          <p className={styles.label}>Fuente principal</p>
          <p className={styles.value}>
            {latestUrl ? (
              <a className={styles.link} href={latestUrl} target="_blank" rel="noreferrer">
                {latestSourceLabel}
              </a>
            ) : (
              latestSourceLabel
            )}
          </p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Ultimo dia reportado</p>
          <p className={styles.value}>{status.ultimoDiaEvento ?? "Sin dato disponible"}</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Coincidencias recientes aceptadas</p>
          <p className={styles.value}>{status.coincidenciasRecientes}</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Estado del monitoreo</p>
          <p className={styles.value}>{status.estadoActual.replaceAll("_", " ")}</p>
        </article>
      </div>
    </section>
  );
}
