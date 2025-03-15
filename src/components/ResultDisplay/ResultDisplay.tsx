import React from 'react';
import { ResultDisplayProps } from '../../types/wheel';
import styles from './ResultDisplay.module.css';

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ selectedOption }) => {
  if (!selectedOption) {
    return (
      <div className={styles.container}>
        <p className={styles.placeholder}>转动转盘选择午餐！</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>今天吃这个！</h2>
      <div 
        className={styles.result}
        style={{ backgroundColor: selectedOption.color }}
      >
        {selectedOption.label}
      </div>
    </div>
  );
}; 