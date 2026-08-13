"use client";
import React, { useState } from 'react';
import { FiMenu, FiX, FiChevronDown, FiChevronUp, FiZap, FiCode, FiPlus } from 'react-icons/fi';

interface HeaderBarProps {
  dayOffset: string;
  onDayChange: (value: string) => void;
  onTogglePanel: () => void;
  isPanelOpen: boolean;
  onToggleAllCharts: () => void;
  areAllChartsOpen: boolean;
  onToggleTicker: () => void;
  isTickerOpen: boolean;
  onOpenEmbedHelper: () => void;
  selectedGroup: 'ALL' | 'GO' | 'OFERTAS';
  onGroupChange: (group: 'ALL' | 'GO' | 'OFERTAS') => void;
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
  areAllChartsOpen,
  onToggleTicker,
  isTickerOpen,
  onOpenEmbedHelper,
  selectedGroup,
  onGroupChange
}: HeaderBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header-bar">
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Menu"
      >
        {isMobileMenuOpen ? <FiX /> : <FiMenu />}
      </button>

      <button onClick={onTogglePanel} className="desktop-menu-button" aria-label="Adicionar cidade" title="Adicionar Cidade">
        {isPanelOpen ? <FiX /> : <FiPlus />}
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

      <div className={`mobile-menu-container ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="header-left-actions">
          <button onClick={() => { onTogglePanel(); setIsMobileMenuOpen(false); }} className="toggle-all-charts-btn mobile-add-city-btn" title="Adicionar Cidade">
            <span>Adicionar Cidade</span>
            <FiPlus />
          </button>
          <button 
            className={`group-filter-btn ${selectedGroup === 'ALL' ? 'active' : ''}`}
            onClick={() => onGroupChange('ALL')}
          >
            Todos
          </button>
          <button 
            className={`group-filter-btn ${selectedGroup === 'GO' ? 'active' : ''}`}
            onClick={() => onGroupChange('GO')}
          >
            GO
          </button>
          <button 
            className={`group-filter-btn ${selectedGroup === 'OFERTAS' ? 'active' : ''}`}
            onClick={() => onGroupChange('OFERTAS')}
          >
            OFERTAS
          </button>
        </div>

        <div className="header-actions">
          <button onClick={onOpenEmbedHelper} className="toggle-all-charts-btn" title="Gerar Código Embed">
            <span>Embed</span>
            <FiCode />
          </button>
          <button onClick={onToggleTicker} className="toggle-all-charts-btn">
            <span>{isTickerOpen ? 'Fechar Resumo' : 'Resumo do Tempo'}</span>
          </button>
          <button onClick={onToggleAllCharts} className="toggle-all-charts-btn">
            <span>{areAllChartsOpen ? 'Fechar' : 'Mostrar Chuva'}</span>
            {areAllChartsOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
    </header>
  );
}