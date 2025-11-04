// app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "./components/controls/Footer";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Cards de Clima",
  description: "Cards fáceis para visualização de previsão do tempo.",
};

/**
 * The root layout for the application.
 * It sets up the HTML structure, includes the Poppins font, and wraps the content in a site wrapper.
 * It also includes Vercel's Speed Insights and Analytics.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render.
 * @returns The root layout component.
 */
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
        <SpeedInsights />
        <Analytics />     
      </body>
    </html>
  );
}