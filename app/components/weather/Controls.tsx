"use client";

import React from 'react';

// Interface de propriedades para o componente
interface ControlsProps {
  dayOffset: string;
  onDayChange: (value: string) => void;
  newCity: string;
  onNewCityChange: (value: string) => void;
  onAddCity: () => void;
}

// Função para formatar a data
const getFormattedDate = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(date);
  const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

  return `${capitalizedDay} (${day}/${month})`;
};

export function Controls({
  dayOffset,
  onDayChange,
  newCity,
  onNewCityChange, 
  onAddCity
}: ControlsProps) {
  return (
    <div className="controls">
      <div className="day-selector">
        <button
          className={dayOffset === "0" ? "active" : ""}
          onClick={() => onDayChange("0")}
        >
          {getFormattedDate(0)}
        </button>
        <button
          className={dayOffset === "1" ? "active" : ""}
          onClick={() => onDayChange("1")}
        >
          {getFormattedDate(1)}
        </button>
        <button
          className={dayOffset === "2" ? "active" : ""}
          onClick={() => onDayChange("2")}
        >
          {getFormattedDate(2)}
        </button>
      </div>
      
      <div className="input-group">
        <input
          type="text"
          className="city-input"
          placeholder="Ex: Chapecó, SC"
          value={newCity}
          onChange={(e) => onNewCityChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onAddCity();
            }
          }}
        />
        
        <button onClick={onAddCity} className="add-btn">
          Adicionar
        </button>
      </div>
    </div>
  );
}