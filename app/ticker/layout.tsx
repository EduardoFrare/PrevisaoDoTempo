// app/ticker/layout.tsx
import React from 'react';
import '../globals.css';

export default function TickerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
