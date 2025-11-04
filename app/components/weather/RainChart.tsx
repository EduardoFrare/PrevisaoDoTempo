// app/components/weather/RainChart.tsx
"use client";

import React from 'react';

interface RainHour {
  hour: number;
  rain: number;
}

interface RainChartProps {
  rainHours: RainHour[];
}

/**
 * A component that displays a bar chart of hourly rain data.
 * @param {object} props - The component props.
 * @param {RainHour[]} props.rainHours - An array of objects, each containing the hour and the amount of rain.
 * @returns The RainChart component.
 */
export default function RainChart({ rainHours }: RainChartProps) {
  const maxRain = Math.max(...rainHours.map(h => h.rain), 1);

  return (
    <>
      <div className="rain-chart">
        {rainHours.map(({ hour, rain }) => (
          <div key={hour} className="chart-bar-item">
            <span className="label-rain">
              {String(hour).padStart(2, '0')}:00
              <br />
              {(rain ?? 0).toFixed(1)} mm
            </span>
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