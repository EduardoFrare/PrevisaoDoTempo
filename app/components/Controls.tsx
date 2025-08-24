// app/components/Controls.tsx
"use client";

import React from 'react';

interface ControlsProps {
  dayOffset: string;
  onDayChange: (value: string) => void;
  newCity: string;
  onNewCityChange: (value: string) => void;
  onAddCity: () => void;
}

export default function Controls({ 
  dayOffset, 
  onDayChange, 
  newCity, 
  onNewCityChange, 
  onAddCity 
}: ControlsProps) {
  return (
    <div className="controls">
      <select
        className="day-select"
        value={dayOffset}
        onChange={(e) => onDayChange(e.target.value)}
      >
        <option value="0">Hoje</option>
        <option value="1">Amanhã</option>
        <option value="2">Daqui a 2 dias</option>
      </select>
      <input
        type="text"
        className="city-input"
        placeholder="Adicionar cidade"
        value={newCity}
        onChange={(e) => onNewCityChange(e.target.value)}
      />
      <button onClick={onAddCity} className="add-btn">
        Adicionar
      </button>
    </div>
  );
}