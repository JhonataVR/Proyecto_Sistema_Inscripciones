import "./globals.css";
import { ThemeProvider } from "next-themes";
import React from "react";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem>
        
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}