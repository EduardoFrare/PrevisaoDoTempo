// app/components/LoadingIndicator.tsx
"use client";

import { WiCloud } from 'react-icons/wi';

interface LoadingIndicatorProps {
  showText?: boolean;
}

/**
 * A loading indicator component.
 * It displays a cloud icon and a "Carregando dados..." message.
 * @param {object} props - The component props.
 * @param {boolean} [props.showText=true] - Whether to show the loading text.
 * @returns The LoadingIndicator component.
 */
export default function LoadingIndicator({ showText = true }: LoadingIndicatorProps) {
  return (
    <div className="loading-indicator">
      <WiCloud className="loading-icon" />
      {showText && <p>Carregando dados...</p>}
    </div>
  );
}