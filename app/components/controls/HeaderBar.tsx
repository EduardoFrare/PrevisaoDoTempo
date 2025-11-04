"use client";
import React from 'react';
import { FiMenu, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface HeaderBarProps {
  dayOffset: string;
  onDayChange: (value: string) => void;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
  onToggleAllCharts: () => void;
  areAllChartsOpen: boolean;
  onToggleTicker: () => void;
  isTickerOpen: boolean;
}

/**
 * Formats a date based on an offset from the current date.
 * @param offset - The number of days from today.
 * @returns A formatted date string (e.g., "Seg (01-01)").
 */
const getFormattedDate = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
  const capitalizedDay = (dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)).replace('.', '');
  return `${capitalizedDay} (${day}-${month})`;
};

/**
 * The header bar component for the application.
 * It contains the day selector, a button to toggle the "Add City" panel,
 * and buttons to toggle the rain charts and the weather ticker.
 * @param {object} props - The component props.
 * @param {string} props.dayOffset - The currently selected day offset.
 * @param {(value: string) => void} props.onDayChange - Function to call when the selected day changes.
 * @param {() => void} props.onTogglePanel - Function to call when the "Add City" panel is toggled.
 * @param {boolean} props.isPanelOpen - Whether the "Add City" panel is open.
 * @param {() => void} props.onToggleAllCharts - Function to call when the rain charts are toggled.
 * @param {boolean} props.areAllChartsOpen - Whether the rain charts are open.
 * @param {() => void} props.onToggleTicker - Function to call when the weather ticker is toggled.
 * @param {boolean} props.isTickerOpen - Whether the weather ticker is open.
 * @returns The HeaderBar component.
 */
export function HeaderBar({
  dayOffset,
  onDayChange,
  onTogglePanel,
  isPanelOpen,
  onToggleAllCharts,
  areAllChartsOpen,
  onToggleTicker,
  isTickerOpen
}: HeaderBarProps) {
  return (
    <header className="header-bar">
      <button onClick={onTogglePanel} className="menu-button" aria-label="Adicionar cidade">
        {isPanelOpen ? <FiX /> : <FiMenu />}
      </button>
      <div className="day-selector">
        <button className={dayOffset === "0" ? "active" : ""} onClick={() => onDayChange("0")}>
          {getFormattedDate(0)}
        </button>
        <button className={dayOffset === "1" ? "active" : ""} onClick={() => onDayChange("1")}>
          {getFormattedDate(1)}
        </button>
        <button className={dayOffset === "2" ? "active" : ""} onClick={() => onDayChange("2")}>
          {getFormattedDate(2)}
        </button>
        <button className={dayOffset === "3" ? "active" : ""} onClick={() => onDayChange("3")}>
          {getFormattedDate(3)}
        </button>
        <button className={dayOffset === "4" ? "active" : ""} onClick={() => onDayChange("4")}>
          {getFormattedDate(4)}
        </button>
      </div>
      <div className="header-actions">
        <button onClick={onToggleTicker} className="toggle-all-charts-btn">
          <span>{isTickerOpen ? 'Fechar Resumo' : 'Resumo do Tempo'}</span>
        </button>
        <button onClick={onToggleAllCharts} className="toggle-all-charts-btn">
          <span>{areAllChartsOpen ? 'Fechar' : 'Mostrar Chuva'}</span>
          {areAllChartsOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>
    </header>
  );
}