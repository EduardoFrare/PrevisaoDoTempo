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

/**
 * A modal component to display the AI-generated summary.
 * It shows a loading indicator while the summary is being generated
 * and displays the summary and the model used once it's available.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {() => void} props.onClose - Function to call when the modal is closed.
 * @param {string} props.summary - The AI-generated summary to display.
 * @param {string} props.modelUsed - The name of the AI model used to generate the summary.
 * @param {boolean} props.isLoading - Whether the summary is currently being loaded.
 * @returns The modal component or null if it's not open.
 */
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