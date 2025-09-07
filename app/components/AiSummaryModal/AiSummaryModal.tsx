// app/components/AiSummaryModal/AiSummaryModal.tsx
"use client";

import { X } from "lucide-react";
import styles from './AiSummaryModal.module.css'; // Importa o CSS como um módulo

type AiSummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  isLoading: boolean;
};

export function AiSummaryModal({ isOpen, onClose, summary, isLoading }: AiSummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>Resumo do Agente de IA</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
        </div>
        <div className={styles.body}>
          {isLoading ? (
            <div className={styles.loadingSpinner}></div>
          ) : (
            <p>{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}