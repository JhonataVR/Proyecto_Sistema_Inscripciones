import "./globals.css";
import { ThemeProvider } from "next-themes";
import React from "react";
import { Metadata } from "next";
import TitleEffect from "@/components/TitleEffect";
export const metadata: Metadata = {
title: 'Inscripciones Ingeniería de Sistemas',
description: 'The official Next.js Course Dashboard, built with App Router.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
          <TitleEffect />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
