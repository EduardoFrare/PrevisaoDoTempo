// app/ticker/layout.tsx
import React from 'react';
import '../globals.css'; // Keep globals for ticker styling, but override body background
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function TickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className={poppins.className} style={{ background: 'transparent' }}>
          {children}
      </body>
    </html>
  );
}
