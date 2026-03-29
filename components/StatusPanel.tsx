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
}

export function StatusPanel({ status, fetchedAt }: StatusPanelProps) {
  const alertClassName = styles[status.nivelAlerta] ?? styles.desconocida;

  return (
    <section className={styles.panel} aria-labelledby="status-panel-title">
      <div className={styles.header}>
        <h2 id="status-panel-title" className={styles.title}>
          Estado actual
        </h2>
        <span className={`${styles.badge} ${alertClassName}`}>{ALERT_LABELS[status.nivelAlerta]}</span>
      </div>

      <div className={styles.grid}>
        <article className={styles.item}>
          <p className={styles.label}>Última revisión automática</p>
          <p className={styles.value}>{formatSpanishDate(status.ultimaRevision)}</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Última sincronización del panel</p>
          <p className={styles.value}>{formatSpanishDate(fetchedAt)}</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Último titular</p>
          <p className={styles.value}>{status.ultimoTitulo ?? "Sin titular disponible"}</p>
        </article>

        <article className={styles.item}>
          <p className={styles.label}>Fuente principal</p>
          <p className={styles.value}>
            {status.ultimaUrl ? (
              <a
                className={styles.link}
                href={status.ultimaUrl}
                target="_blank"
                rel="noreferrer"
              >
                {status.ultimaFuente ?? "Abrir reporte"}
              </a>
            ) : (
              status.ultimaFuente ?? "Sin fuente disponible"
            )}
          </p>
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
