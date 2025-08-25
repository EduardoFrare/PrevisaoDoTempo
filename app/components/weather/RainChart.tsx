// app/components/RainChart.tsx
"use client";

import React from 'react'; // É uma boa prática importar React para usar Fragments

interface RainHour {
  hour: number;
  rain: number;
}

interface RainChartProps {
  rainHours: RainHour[];
}

export default function RainChart({ rainHours }: RainChartProps) {
  const maxRain = Math.max(...rainHours.map(h => h.rain), 1);

  // ALTERAÇÃO AQUI: Removemos a div externa com a classe "rain-hours"
  // e usamos um Fragment (<>...</>) para agrupar os elementos.
  return (
    <>
      <p className="rain-title">💧 Precipitação por Hora (mm)</p>
      <div className="rain-chart">
        {rainHours.map(({ hour, rain }) => (
          <div key={hour} className="chart-bar-item">
            <span className="label-rain">{(rain ?? 0).toFixed(1)}</span>
            <div className="bar-container">
              <div
                className="bar"
                style={{ height: `${(rain / maxRain) * 100}%` }}
              ></div>
            </div>
            <span className="label-hour">{String(hour).padStart(2, '0')}h</span>
          </div>
        ))}
      </div>
    </>
  );
}