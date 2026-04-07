import { NextResponse } from "next/server";

import { normalizeStatsPayload, normalizeStatusPayload } from "@/lib/normalizers";
import type { StatusApiResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET() {
  const statusUrl = process.env.N8N_STATUS_URL;
  const statsUrl = process.env.N8N_STATS_URL;
  const fetchedAt = new Date().toISOString();

  if (!statusUrl) {
    const body: StatusApiResponse = {
      ok: false,
      error: "La variable de entorno N8N_STATUS_URL no está configurada.",
      fetchedAt
    };

    return NextResponse.json(body, { status: 500 });
  }

  try {
    const response = await fetch(statusUrl, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      const body: StatusApiResponse = {
        ok: false,
        error: `El origen respondió con estado ${response.status}.`,
        fetchedAt
      };

      return NextResponse.json(body, { status: 502 });
    }

    const rawPayload: unknown = await response.json();
    const data = normalizeStatusPayload(rawPayload);
    const statsResponse = statsUrl
      ? await fetch(statsUrl, {
          method: "GET",
          headers: {
            Accept: "application/json"
          },
          cache: "no-store",
          signal: AbortSignal.timeout(15000)
        })
      : null;

    if (statsResponse?.ok) {
      const rawStatsPayload: unknown = await statsResponse.json();
      data.reporteEstadistico = normalizeStatsPayload(rawStatsPayload);
    }

    const body: StatusApiResponse = {
      ok: true,
      data,
      fetchedAt
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    const body: StatusApiResponse = {
      ok: false,
      error:
        error instanceof Error
          ? `No fue posible consultar el estado: ${error.message}`
          : "No fue posible consultar el estado en este momento.",
      fetchedAt
    };

    return NextResponse.json(body, { status: 500 });
  }
}
