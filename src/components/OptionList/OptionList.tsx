import React, { useState, useEffect } from 'react';
import { WheelOption } from '../../types/wheel';
import styles from './OptionList.module.css';

interface OptionListProps {
  options: WheelOption[];
  onOptionsChange: (options: WheelOption[]) => void;
}

export const OptionList: React.FC<OptionListProps> = ({ options, onOptionsChange }) => {
  // 在组件渲染时记录选项数据，便于调试
  useEffect(() => {
    console.log('OptionList 渲染选项:', options);
  }, [options]);

  const [newOption, setNewOption] = useState<Partial<WheelOption>>({
    label: '',
    color: '#' + Math.floor(Math.random() * 16777215).toString(16), // 随机颜色
    weight: 1
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 计算总权重和百分比
  const totalWeight = options.reduce((sum, option) => sum + (option.weight || 1), 0);
  
  // 计算各选项的精确百分比
  const calculateExactPercentages = () => {
    const exactPercentages = options.map(option => {
      return {
        id: option.id,
        percentage: ((option.weight || 1) / totalWeight) * 100
      };
    });
    
    // 先进行四舍五入计算
    let roundedPercentages = exactPercentages.map(item => ({
      id: item.id,
      percentage: Math.round(item.percentage)
    }));
    
    // 计算四舍五入后的总和
    const totalRounded = roundedPercentages.reduce((sum, item) => sum + item.percentage, 0);
    
    // 如果总和不是100%，调整最大值选项的百分比
    if (totalRounded !== 100 && options.length > 0) {
      const diff = 100 - totalRounded;
      // 找到最大百分比的选项
      const maxPercentageItem = roundedPercentages.reduce(
        (max, item) => item.percentage > max.percentage ? item : max, 
        roundedPercentages[0]
      );
      
      // 调整最大值选项的百分比
      roundedPercentages = roundedPercentages.map(item => {
        if (item.id === maxPercentageItem.id) {
          return { ...item, percentage: item.percentage + diff };
        }
        return item;
      });
    }
    
    // 返回一个id到百分比的映射
    return roundedPercentages.reduce((map, item) => {
      map[item.id] = item.percentage;
      return map;
    }, {} as Record<string, number>);
  };
  
  // 获取校正后的百分比映射
  const percentagesMap = calculateExactPercentages();
  
  // 获取指定选项的百分比
  const getPercentage = (id: string) => {
    return percentagesMap[id] || 0;
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
    
    console.log('添加新选项:', option);
    onOptionsChange([...options, option]);
    setNewOption({
      label: '',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      weight: 1
    });
  };

  const handleDeleteOption = (id: string) => {
    console.log('删除选项:', id);
    onOptionsChange(options.filter(option => option.id !== id));
  };

  const handleWeightChange = (id: string, weight: number) => {
    console.log('修改权重:', id, weight);
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
    console.log('重置所有权重');
    onOptionsChange(
      options.map(option => ({ ...option, weight: 1 }))
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>选项列表</h3>
      
      {options.length === 0 ? (
        <p className={styles.noOptions}>暂无选项，请添加</p>
      ) : (
        <table className={styles.optionsTable}>
          <thead>
            <tr>
              <th>颜色</th>
              <th>名称</th>
              <th>权重</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {options.map(option => {
              const percentage = getPercentage(option.id);
              return (
                <tr key={option.id} className={styles.optionRow}>
                  <td>
                    <div 
                      className={styles.colorIndicator} 
                      style={{ backgroundColor: option.color }}
                    />
                  </td>
                  <td className={styles.labelCell}>
                    {/* 显示标签名，加载样式 */}
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 6px',
                      backgroundColor: option.color,
                      color: 'white',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                    }}>
                      {option.label || '未命名选项'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.weightCell}>
                      <input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={option.weight || 1} 
                        onChange={e => handleWeightChange(option.id, parseInt(e.target.value) || 1)}
                        className={styles.weightInput}
                      />
                      <div className={styles.percentBar}>
                        <div 
                          className={styles.percentFill}
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: option.color
                          }}
                        />
                      </div>
                      <span className={styles.percentage}>{percentage}%</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => handleDeleteOption(option.id)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
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
            value={newOption.color || '#000000'}
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