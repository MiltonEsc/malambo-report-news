"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "@/components/TimerCard.module.css";
import { clampElapsedMs, formatDuration, formatSpanishDate, parseDateSafely } from "@/lib/time";

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
  const durationLabel = formatDuration(elapsed);

  return (
    <section className={styles.card} aria-labelledby="main-counter-title">
      <span className={styles.eyebrow}>Monitoreo ciudadano de {municipality}</span>
      <h1 id="main-counter-title" className={styles.title}>
        Malambo sin homicidios o intentos recientes
      </h1>
      <p className={styles.description}>
        El contador se reinicia cuando la automatización detecta un homicidio, atentado o
        intento de homicidio reciente en fuentes monitoreadas.
      </p>

      <div className={styles.clockWrap} aria-live="polite" aria-atomic="true">
        <p className={styles.clockLabel}>Último tiempo sin homicidio o intento de homicidio</p>
        {parsedDate ? (
          <p className={styles.clockValue}>{durationLabel}</p>
        ) : (
          <p className={styles.clockEmpty}>Sin eventos recientes</p>
        )}
      </div>

      <div className={styles.meta}>
        <span>
          Último evento registrado: <strong>{formatSpanishDate(eventDate)}</strong>
        </span>
        <span>
          Último hallazgo automático: <strong>{formatSpanishDate(foundDate)}</strong>
        </span>
      </div>
    </section>
  );
}
