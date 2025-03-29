import React from 'react';
import { ResultDisplayProps } from '../../types/wheel';
import styles from './ResultDisplay.module.css';
import { useTranslation } from 'react-i18next';

interface ResultDisplayProps {
  selectedOption: {
    label: string;
    color: string;
    // 其他可能的属性
  } | null;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ selectedOption }) => {
  const { t } = useTranslation();
  if (!selectedOption) {
    return (
      <div className={styles.container}>
        <p className={styles.placeholder}>{t('spinToChooseLunch')}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('todaysChoice')}</h2>
      <div 
        className={styles.result}
        style={{ backgroundColor: selectedOption.color }}
      >
        {selectedOption.label}
      </div>
    </div>
  );
}; 