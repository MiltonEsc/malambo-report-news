import { NextResponse } from "next/server";

import { getStoredStats, getStoredStatus } from "@/lib/state-store";
import type { StatusApiResponse } from "@/lib/types";

export const revalidate = 0;

export async function GET() {
  const fetchedAt = new Date().toISOString();

  try {
    const data = await getStoredStatus();
    data.reporteEstadistico = await getStoredStats();

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
