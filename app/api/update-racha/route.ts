import { NextRequest, NextResponse } from "next/server";

import { updateStoredRacha } from "@/lib/state-store";

export const revalidate = 0;

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function asBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "si";
  }

  return false;
}

async function parsePayload(request: NextRequest) {
  if (request.method === "GET") {
    const { searchParams } = new URL(request.url);

    return {
      reset: asBoolean(searchParams.get("reset")),
      diasPaz: asString(searchParams.get("dias_paz")),
      tituloNoticia: asString(searchParams.get("titulo_noticia")),
      fechaNoticia: asString(searchParams.get("fecha_noticia")),
      noticiaUrl: asString(searchParams.get("url_noticia")),
      fuente: asString(searchParams.get("fuente"))
    };
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;

    return {
      reset: asBoolean(body.reset),
      diasPaz: asString(body.dias_paz),
      tituloNoticia: asString(body.titulo_noticia),
      fechaNoticia: asString(body.fecha_noticia),
      noticiaUrl: asString(body.url_noticia),
      fuente: asString(body.fuente)
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();

    return {
      reset: asBoolean(formData.get("reset")),
      diasPaz: asString(formData.get("dias_paz")),
      tituloNoticia: asString(formData.get("titulo_noticia")),
      fechaNoticia: asString(formData.get("fecha_noticia")),
      noticiaUrl: asString(formData.get("url_noticia")),
      fuente: asString(formData.get("fuente"))
    };
  }

  return {
    reset: false,
    diasPaz: null,
    tituloNoticia: null,
    fechaNoticia: null,
    noticiaUrl: null,
    fuente: null
  };
}

async function handleRequest(request: NextRequest) {
  try {
    const payload = await parsePayload(request);
    const state = await updateStoredRacha(payload);

    return NextResponse.json(
      {
        ok: true,
        message: "Racha actualizada correctamente.",
        data: state
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "No fue posible actualizar la racha."
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
