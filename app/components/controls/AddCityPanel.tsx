"use client";
import React from 'react';

interface AddCityPanelProps {
  isOpen: boolean;
  newCity: string;
  onNewCityChange: (value: string) => void;
  onAddCity: () => void;
  errorMsg: string;
}

/**
 * A panel for adding new cities to the weather list.
 * It contains an input field for the city name and an "Add" button.
 * It also displays an error message if the input is invalid.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the panel is open.
 * @param {string} props.newCity - The current value of the new city input.
 * @param {(value: string) => void} props.onNewCityChange - Function to call when the new city input changes.
 * @param {() => void} props.onAddCity - Function to call when the "Add" button is clicked.
 * @param {string} props.errorMsg - The error message to display.
 * @returns The AddCityPanel component.
 */
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