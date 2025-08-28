// app/components/LoadingIndicator.tsx
import React from 'react';
import { WiCloud } from 'react-icons/wi'; // Certifique-se de ter react-icons instalado

const LoadingIndicator = () => {
  return (
    <div className="loading-indicator">
      <WiCloud className="loading-icon" /> {/* Ícone de nuvem */}
      <p>Carregando dados do clima...</p>
    </div>
  );
};

export default LoadingIndicator;