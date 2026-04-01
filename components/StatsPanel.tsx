import styles from "@/components/StatsPanel.module.css";
import type { SecurityStatsReport } from "@/lib/types";
import { formatSpanishDate } from "@/lib/time";

interface StatsPanelProps {
  report: SecurityStatsReport;
}

export function StatsPanel({ report }: StatsPanelProps) {
  const maxCrimeTotal = Math.max(...report.tiposDelito.map((item) => item.total), 1);

  return (
    <section className={styles.panel} aria-labelledby="stats-panel-title">
      <div className={styles.header}>
        <div>
          <h2 id="stats-panel-title" className={styles.title}>
            Reporte estadistico
          </h2>
          <p className={styles.subtitle}>
            Resumen agregado por {report.fuente ?? "la automatizacion"} para {report.municipio}.
          </p>
        </div>
        <span className={styles.badge}>{report.nivelAlerta ?? "Sin nivel"}</span>
      </div>

      <div className={styles.metrics}>
        <article className={styles.metric}>
          <p className={styles.label}>Fecha del reporte</p>
          <p className={styles.value}>{formatSpanishDate(report.fechaReporte, { dateStyle: "long" })}</p>
        </article>
        <article className={styles.metric}>
          <p className={styles.label}>Total de noticias</p>
          <p className={styles.value}>{report.totalNoticias}</p>
        </article>
        <article className={styles.metric}>
          <p className={styles.label}>Indice de inseguridad</p>
          <p className={styles.value}>{report.indiceInseguridad ?? "Sin dato disponible"}</p>
        </article>
      </div>

      <div className={styles.columns}>
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Desglose por delito</h3>
          {report.tiposDelito.length === 0 ? (
            <p className={styles.empty}>Sin desglose disponible.</p>
          ) : (
            <ul className={styles.bars}>
              {report.tiposDelito.map((item) => (
                <li key={item.label} className={styles.barItem}>
                  <div className={styles.barHeader}>
                    <span>{item.label}</span>
                    <strong>{item.total}</strong>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${Math.max((item.total / maxCrimeTotal) * 100, 6)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Zonas con mas menciones</h3>
          {report.rankingZonas.length === 0 ? (
            <p className={styles.empty}>Sin zonas priorizadas.</p>
          ) : (
            <ul className={styles.list}>
              {report.rankingZonas.map((item) => (
                <li key={item.label} className={styles.listItem}>
                  <span>{item.label}</span>
                  <strong>{item.total}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Alertas recientes del reporte</h3>
        {report.alertasRecientes.length === 0 ? (
          <p className={styles.empty}>Sin alertas recientes en este corte.</p>
        ) : (
          <div className={styles.alerts}>
            {report.alertasRecientes.map((alert, index) => (
              <article key={`${alert.title}-${index}`} className={styles.alertItem}>
                <p className={styles.alertZone}>{alert.barrio ?? "Zona no especificada"}</p>
                {alert.link ? (
                  <a className={styles.alertLink} href={alert.link} target="_blank" rel="noreferrer">
                    {alert.title}
                  </a>
                ) : (
                  <p className={styles.alertText}>{alert.title}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
