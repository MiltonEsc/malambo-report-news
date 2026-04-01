import styles from "@/components/ReportsList.module.css";
import type { ReportItem } from "@/lib/types";
import { formatSpanishDate } from "@/lib/time";

interface ReportsListProps {
  reports: ReportItem[];
}

export function ReportsList({ reports }: ReportsListProps) {
  return (
    <section className={styles.panel} aria-labelledby="reports-list-title">
      <div className={styles.header}>
        <h2 id="reports-list-title" className={styles.title}>
          Ultimos reportes aceptados
        </h2>
        <span className={styles.count}>{reports.length}</span>
      </div>

      {reports.length === 0 ? (
        <p className={styles.empty}>
          No hay reportes aceptados en el historial actual del webhook.
        </p>
      ) : (
        <div className={styles.list}>
          {reports.map((report, index) => (
            <article key={`${report.link ?? report.title}-${index}`} className={styles.item}>
              <div className={styles.itemIcon}>{report.trusted ? "OK" : "IN"}</div>

              <div className={styles.itemBody}>
                <h3 className={styles.itemTitle}>
                  {report.link ? (
                    <a
                      className={styles.itemLink}
                      href={report.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {report.title}
                    </a>
                  ) : (
                    report.title
                  )}
                </h3>

                <div className={styles.meta}>
                  <span>{report.source ?? "Fuente no especificada"}</span>
                  <span>{report.tipoEvento ?? "Tipo no especificado"}</span>
                  <span>{formatSpanishDate(report.pubDate)}</span>
                  {report.trusted ? <span className={styles.trusted}>Validado</span> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
