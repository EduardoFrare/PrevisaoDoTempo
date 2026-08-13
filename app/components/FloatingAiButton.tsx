"use client";
import React, { useState } from 'react';
import { FiZap, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface FloatingAiButtonProps {
  onGenerateSummary: () => void;
}

export function FloatingAiButton({ onGenerateSummary }: FloatingAiButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`floating-ai-container ${isExpanded ? 'expanded' : ''}`}>
      <button 
        className="floating-ai-toggle" 
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Toggle AI Button"
      >
        {isExpanded ? <FiChevronRight /> : <FiChevronLeft />}
      </button>
      
      <button 
        className="floating-ai-action" 
        onClick={() => {
          setIsExpanded(false);
          onGenerateSummary();
        }}
        title="Gerar Resumo da IA"
      >
        <FiZap />
        <span>Resumo IA</span>
      </button>
    </div>
  );
}
