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
}

const getFormattedDate = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date);
  const capitalizedDay = (dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)).replace('.', '');
  return `${capitalizedDay} (${day}-${month})`;
};

export function HeaderBar({
  dayOffset,
  onDayChange,
  onTogglePanel,
  isPanelOpen,
  onToggleAllCharts,
  areAllChartsOpen
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
      <button onClick={onToggleAllCharts} className="toggle-all-charts-btn">
        {areAllChartsOpen ? <FiChevronUp /> : <FiChevronDown />}
        <span>{areAllChartsOpen ? 'Fechar' : 'Abrir'}</span>
      </button>
    </header>
  );
}