"use client";
import React from 'react';

interface AddCityPanelProps {
  isOpen: boolean;
  newCity: string;
  onNewCityChange: (value: string) => void;
  onAddCity: () => void;
  errorMsg: string;
}

export function AddCityPanel({ isOpen, newCity, onNewCityChange, onAddCity, errorMsg }: AddCityPanelProps) {
  return (
    <div className={`add-city-panel ${isOpen ? 'open' : ''}`}>
      <div className="input-group">
        <input
          type="text"
          className="city-input"
          placeholder="Ex: Chapecó, SC"
          value={newCity}
          onChange={(e) => onNewCityChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAddCity();
          }}
        />
        <button onClick={onAddCity} className="add-btn">
          Adicionar
        </button>
      </div>
      {errorMsg && <p className="error-msg-panel">{errorMsg}</p>}
    </div>
  );
}