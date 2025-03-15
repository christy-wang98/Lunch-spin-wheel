import React, { useState } from 'react';
import { WheelOption } from '../../types/wheel';
import styles from './OptionList.module.css';

interface OptionListProps {
  options: WheelOption[];
  onOptionsChange: (options: WheelOption[]) => void;
}

export const OptionList: React.FC<OptionListProps> = ({ options, onOptionsChange }) => {
  const [newOption, setNewOption] = useState<Partial<WheelOption>>({
    label: '',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16), // 随机颜色
    weight: 1
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 计算总权重和百分比
  const totalWeight = options.reduce((sum, option) => sum + (option.weight || 1), 0);
  
  // 计算每个选项的百分比
  const calculatePercentage = (weight: number) => {
    return Math.round((weight / totalWeight) * 100);
  };

  // 检查选项名称是否已存在
  const isOptionExists = (label: string): boolean => {
    return options.some(option => 
      option.label.toLowerCase().trim() === label.toLowerCase().trim()
    );
  };

  // 处理选项名称输入变化
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const label = e.target.value;
    setNewOption({ ...newOption, label });
    
    // 验证选项是否已存在
    if (label.trim() !== '' && isOptionExists(label)) {
      setErrorMessage(`"${label}" 已存在，请输入不同的选项名称`);
    } else {
      setErrorMessage('');
    }
  };

  const handleAddOption = () => {
    if (!newOption.label || errorMessage) return;
    
    const newId = Date.now().toString();
    const option: WheelOption = {
      id: newId,
      label: newOption.label,
      color: newOption.color || '#' + Math.floor(Math.random() * 16777215).toString(16),
      weight: newOption.weight || 1
    };
    
    onOptionsChange([...options, option]);
    setNewOption({
      label: '',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      weight: 1
    });
  };

  const handleDeleteOption = (id: string) => {
    onOptionsChange(options.filter(option => option.id !== id));
  };

  const handleWeightChange = (id: string, weight: number) => {
    onOptionsChange(
      options.map(option => {
        if (option.id === id) {
          return { ...option, weight };
        }
        return option;
      })
    );
  };

  const handleResetWeights = () => {
    onOptionsChange(
      options.map(option => ({ ...option, weight: 1 }))
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>选项列表</h3>
      
      <div className={styles.optionList}>
        {options.map(option => {
          const percentage = calculatePercentage(option.weight || 1);
          return (
            <div key={option.id} className={styles.optionItem}>
              <div 
                className={styles.colorIndicator} 
                style={{ backgroundColor: option.color }}
              />
              <div className={styles.optionLabel}>{option.label}</div>
              <div className={styles.weightInfo}>
                <div className={styles.percentBar}>
                  <div 
                    className={styles.percentFill}
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: option.color
                    }}
                  />
                </div>
                <div className={styles.weightControl}>
                  <label>权重:</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="10"
                    value={option.weight || 1} 
                    onChange={e => handleWeightChange(option.id, parseInt(e.target.value) || 1)}
                  />
                  <span className={styles.percentage}>{percentage}%</span>
                </div>
              </div>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDeleteOption(option.id)}
              >
                删除
              </button>
            </div>
          );
        })}
      </div>
      
      <div className={styles.addOptionForm}>
        <h4>添加新选项</h4>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="输入选项名称"
            value={newOption.label}
            onChange={handleLabelChange}
            className={errorMessage ? styles.inputError : ''}
          />
          <input
            type="color"
            value={newOption.color}
            onChange={e => setNewOption({ ...newOption, color: e.target.value })}
          />
        </div>
        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
        <button 
          className={styles.addButton}
          onClick={handleAddOption}
          disabled={!newOption.label || !!errorMessage}
        >
          添加
        </button>
      </div>
      
      <button 
        className={styles.resetButton}
        onClick={handleResetWeights}
      >
        重置所有权重
      </button>
    </div>
  );
}; 