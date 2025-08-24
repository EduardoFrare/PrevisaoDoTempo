// app/components/RainChart.tsx
"use client";

interface RainHour {
  hour: number;
  rain: number;
}

interface RainChartProps {
  rainHours: RainHour[];
}

export default function RainChart({ rainHours }: RainChartProps) {
  // Encontra a maior precipitação para calcular a altura relativa das barras
  const maxRain = Math.max(...rainHours.map(h => h.rain), 1);

  return (
    <div className="rain-hours">
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
    </div>
  );
}