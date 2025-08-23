// Caminho do arquivo: app/layout.tsx

import type { Metadata } from "next";
// 1. Importe a fonte que você quer usar do next/font/google
import { Poppins } from "next/font/google"; 
import "./globals.css";

// 2. Configure a fonte.
// 'subsets' informa quais caracteres carregar (latin é o padrão para nosso alfabeto)
// 'weight' informa os pesos da fonte que vamos usar
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Meu App de Clima",
  description: "Previsão do tempo criada com Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}