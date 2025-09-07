// app/components/AiSummaryModal/AiSummaryModal.tsx
"use client";

import { FiX } from 'react-icons/fi';
import styles from './AiSummaryModal.module.css';
// 1. Importar o nosso componente de loading
import LoadingIndicator from '../LoadingIndicator';

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
          <button onClick={onClose} className={styles.closeBtn}><FiX size={24} /></button>
        </div>
        <div className={styles.body}>
          {isLoading ? (
            // 2. Usar o LoadingIndicator com showText={false}
            <div className={styles.loadingContainer}>
              <LoadingIndicator showText={false} />
            </div>
          ) : (
            <p>{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}