// app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "./components/controls/Footer"; 

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Cards de Clima",
  description: "Cards fáceis para visualização de previsão do tempo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={poppins.className}>
        <div className="site-wrapper">
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}