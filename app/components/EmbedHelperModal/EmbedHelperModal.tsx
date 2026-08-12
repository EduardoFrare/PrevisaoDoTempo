"use client";

import React, { useState, useEffect } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import styles from './EmbedHelperModal.module.css';

type EmbedHelperModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function EmbedHelperModal({ isOpen, onClose }: EmbedHelperModalProps) {
  const [mode, setMode] = useState<'group' | 'custom'>('group');
  const [group, setGroup] = useState('ALL');
  const [customCities, setCustomCities] = useState('São Paulo, SP | Rio de Janeiro, RJ');
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Get the base URL from the window object
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  let queryParams = '';
  if (mode === 'custom' && customCities.trim() !== '') {
    queryParams = `?cities=${encodeURIComponent(customCities)}`;
  } else if (mode === 'group' && group !== 'ALL') {
    queryParams = `?group=${group}`;
  }

  const iframeSrc = `${baseUrl}/embed/ticker${queryParams}`;
  const iframeCode = `<iframe src="${iframeSrc}" width="100%" height="60" frameborder="0" scrolling="no"></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h3>Widget Embeddável</h3>
          <button onClick={onClose} className={styles.closeBtn}><FiX size={24} /></button>
        </div>
        <div className={styles.body}>
          <p>Gere o código HTML para adicionar o Ticker de clima em outras plataformas.</p>
          
          <div className={styles.modeToggle}>
            <label className={styles.radioLabel}>
              <input type="radio" checked={mode === 'group'} onChange={() => setMode('group')} /> Por Grupo
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" checked={mode === 'custom'} onChange={() => setMode('custom')} /> Cidades Específicas
            </label>
          </div>

          {mode === 'group' ? (
            <div className={styles.formGroup}>
              <label className={styles.label}>Filtrar Cidades por Grupo</label>
              <select 
                className={styles.select}
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="ALL">Todas as Cidades</option>
                <option value="GO">Grupo GO</option>
                <option value="OFERTAS">Grupo OFERTAS</option>
              </select>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label}>Cidades (Ex: Curitiba, PR | Manaus, AM)</label>
              <input 
                type="text" 
                className={styles.input}
                value={customCities}
                onChange={(e) => setCustomCities(e.target.value)}
                placeholder="Ex: São Paulo, SP | Rio de Janeiro, RJ"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Código HTML (Iframe)</label>
            <div className={styles.codeBlock}>
              {iframeCode}
            </div>
          </div>

          <button 
            className={`${styles.copyBtn} ${copied ? styles.copied : ''}`} 
            onClick={handleCopy}
          >
            {copied ? <><FiCheck size={18} /> Copiado!</> : <><FiCopy size={18} /> Copiar Código</>}
          </button>
        </div>
      </div>
    </div>
  );
}
