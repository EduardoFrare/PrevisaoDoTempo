// app/components/AiSummaryModal/AiSummaryModal.tsx
"use client";

import { FiX } from 'react-icons/fi';
import styles from './AiSummaryModal.module.css';
import LoadingIndicator from '../LoadingIndicator';

type AiSummaryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  summary: string;
  modelUsed: string; // Nova propriedade para o nome do modelo
  isLoading: boolean;
};

export function AiSummaryModal({ isOpen, onClose, summary, modelUsed, isLoading }: AiSummaryModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>Agente de IA</h3>
          {!isLoading && modelUsed && (
            <span className={styles.modelTag}>{modelUsed}</span>
          )}
          <button onClick={onClose} className={styles.closeBtn}><FiX size={24} /></button>
        </div>
        <div className={styles.body}>
          {isLoading ? (
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