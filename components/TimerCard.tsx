"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/TimerCard.module.css";
import {
  clampElapsedMs,
  formatDurationParts,
  formatSpanishDate,
  parseDateSafely
} from "@/lib/time";

interface TimerCardProps {
  municipality: string;
  eventDate: string | null;
  foundDate: string | null;
}

export function TimerCard({ municipality, eventDate, foundDate }: TimerCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const parsedDate = useMemo(() => parseDateSafely(eventDate), [eventDate]);
  const elapsed = clampElapsedMs(parsedDate, now);
  const duration = formatDurationParts(elapsed);

  return (
    <section className={styles.card} aria-labelledby="main-counter-title">
      <div className={styles.badge}>Monitoreo ciudadano activo en {municipality}</div>

      <div className={styles.copy}>
        <p className={styles.kicker}>Tiempo transcurrido sin homicidios o intentos recientes</p>
        <h1 id="main-counter-title" className={styles.title}>
          Malambo bajo observacion continua
        </h1>
      </div>

      <div className={styles.clockWrap} aria-live="polite" aria-atomic="true">
        {duration ? (
          <div className={styles.metricGrid}>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{duration.days}</span>
              <span className={styles.metricLabel}>dias</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{String(duration.hours).padStart(2, "0")}</span>
              <span className={styles.metricLabel}>horas</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{String(duration.minutes).padStart(2, "0")}</span>
              <span className={styles.metricLabel}>min</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{String(duration.seconds).padStart(2, "0")}</span>
              <span className={styles.metricLabel}>seg</span>
            </div>
          </div>
        ) : (
          <p className={styles.clockEmpty}>Sin eventos recientes validados</p>
        )}
      </div>

      <p className={styles.description}>
        El contador se reinicia cuando la automatizacion detecta un homicidio, atentado o
        intento de homicidio reciente en fuentes monitoreadas.
      </p>

      <div className={styles.meta}>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>Ultimo evento registrado</span>
          <strong className={styles.metaValue}>{formatSpanishDate(eventDate)}</strong>
        </article>
        <article className={styles.metaCard}>
          <span className={styles.metaLabel}>Ultimo hallazgo automatico</span>
          <strong className={styles.metaValue}>{formatSpanishDate(foundDate)}</strong>
        </article>
      </div>
    </section>
  );
}
