import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-headline"
});

export const metadata: Metadata = {
  title: "Malambo sin homicidios o intentos recientes",
  description:
    "Contador publico con el tiempo transcurrido desde el ultimo homicidio, atentado o intento de homicidio detectado en Malambo.",
  applicationName: "Malambo Status",
  keywords: [
    "Malambo",
    "Atlantico",
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
      "Consulta el tiempo transcurrido desde el ultimo evento violento reciente detectado.",
    locale: "es_CO",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Malambo sin homicidios o intentos recientes",
    description:
      "Contador publico del tiempo transcurrido desde el ultimo homicidio, atentado o intento de homicidio reciente."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${manrope.variable}`}>{children}</body>
    </html>
  );
}
