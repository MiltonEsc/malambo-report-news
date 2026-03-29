import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "Malambo sin homicidios o intentos recientes",
  description:
    "Contador público con el tiempo transcurrido desde el último homicidio, atentado o intento de homicidio detectado en Malambo, Atlántico.",
  applicationName: "Malambo Status",
  keywords: [
    "Malambo",
    "Atlántico",
    "seguridad",
    "contador",
    "noticias",
    "homicidio",
    "atentado"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Malambo sin homicidios o intentos recientes",
    description:
      "Consulta el tiempo transcurrido desde el último evento violento reciente detectado.",
    locale: "es_CO",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Malambo sin homicidios o intentos recientes",
    description:
      "Contador público del tiempo transcurrido desde el último homicidio, atentado o intento de homicidio reciente."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
