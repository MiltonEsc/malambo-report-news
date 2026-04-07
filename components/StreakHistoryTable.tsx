import styles from "@/components/StreakHistoryTable.module.css";
import type { StreakHistoryItem } from "@/lib/types";
import { formatSpanishDate } from "@/lib/time";

interface StreakHistoryTableProps {
  streaks: StreakHistoryItem[];
}

export function StreakHistoryTable({ streaks }: StreakHistoryTableProps) {
  return (
    <section className={styles.panel} aria-labelledby="streak-history-title">
      <div className={styles.header}>
        <div>
          <h2 id="streak-history-title" className={styles.title}>
            Historial de rachas
          </h2>
          <p className={styles.subtitle}>
            Registro de reinicios enviados por el webhook para el contador principal.
          </p>
        </div>
        <span className={styles.count}>{streaks.length}</span>
      </div>

      {streaks.length === 0 ? (
        <p className={styles.empty}>El webhook aun no reporta rachas historicas utilizables.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Duracion</th>
                <th>Evento</th>
              </tr>
            </thead>
            <tbody>
              {streaks.map((streak, index) => (
                <tr key={`${streak.rowNumber ?? index}-${streak.endDate ?? index}`}>
                  <td>{streak.rowNumber ?? index + 1}</td>
                  <td>{formatSpanishDate(streak.startDate)}</td>
                  <td>{formatSpanishDate(streak.endDate)}</td>
                  <td>{streak.durationLabel ?? "Sin dato disponible"}</td>
                  <td>
                    {streak.url ? (
                      <a
                        className={styles.link}
                        href={streak.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {streak.eventTitle ?? "Ver evento"}
                      </a>
                    ) : (
                      <span className={styles.text}>{streak.eventTitle ?? "Sin titulo disponible"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
