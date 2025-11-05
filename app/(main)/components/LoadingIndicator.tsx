// app/components/LoadingIndicator.tsx
"use client";

import { WiCloud } from 'react-icons/wi';

interface LoadingIndicatorProps {
  showText?: boolean;
}

export default function LoadingIndicator({ showText = true }: LoadingIndicatorProps) {
  return (
    <div className="loading-indicator">
      <WiCloud className="loading-icon" />
      {showText && <p>Carregando dados...</p>}
    </div>
  );
}