import React, { useState, useEffect } from 'react';
import { WheelOption } from '../../types/wheelOption';
import styles from './OptionList.module.css';
import { useTranslation } from 'react-i18next';

interface OptionListProps {
  options: WheelOption[];
  onOptionsChange: (options: WheelOption[]) => void;
}

// 预定义的颜色，高对比度且容易区分
const predefinedColors = [
  '#E53935', // 鲜红色
  '#1E88E5', // 亮蓝色
  '#43A047', // 草绿色
  '#FFB300', // 琥珀色
  '#6D4C41', // 棕色
  '#00ACC1', // 青色
  '#9C27B0', // 紫色 (只保留一种紫色)
  '#F4511E', // 深橙色
  '#3949AB', // 靛蓝色
  '#039BE5', // 天蓝色
  '#7CB342', // 酸橙色
  '#C0CA33', // 酸黄色
  '#FB8C00', // 橙色
  '#D81B60', // 玫红色
  '#009688', // 蓝绿色 (替换深紫罗兰色)
  '#00897B', // 青绿色
  '#546E7A', // 蓝灰色
  '#FFC107', // 金黄色 (新增)
  '#795548', // 褐色 (新增)
  '#607D8B'  // 灰蓝色 (新增)
];

export const OptionList: React.FC<OptionListProps> = ({ options, onOptionsChange }) => {
  const { t } = useTranslation();
  // 在组件渲染时记录选项数据，便于调试
  useEffect(() => {
    console.log('OptionList 渲染选项:', options);
  }, [options]);

  // 生成不重复的颜色
  const generateUniqueColor = (): string => {
    // 首先尝试从预定义颜色中找一个未使用的
    const usedColors = options.map(opt => opt.color?.toLowerCase() || '').filter(Boolean);
    
    // 按照与现有颜色的差异排序预定义颜色
    const availableColors = predefinedColors
      .filter(color => !usedColors.includes(color.toLowerCase()))
      .sort((colorA, colorB) => {
        // 计算与已使用颜色的最小差异
        const minDiffA = getMinColorDifference(colorA, usedColors);
        const minDiffB = getMinColorDifference(colorB, usedColors);
        // 返回差异大的颜色优先
        return minDiffB - minDiffA;
      });
    
    if (availableColors.length > 0) {
      // 选择差异最大的颜色
      return availableColors[0];
    }
    
    // 如果所有预定义颜色都用完了，生成随机颜色
    // 并尝试确保它与现有颜色有足够差异
    let newColor: string;
    let maxDiff = 0;
    let bestColor = '';
    const attempts = 20; // 尝试20次随机颜色
    
    for (let i = 0; i < attempts; i++) {
      newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      const diff = getMinColorDifference(newColor, usedColors);
      
      if (diff > maxDiff) {
        maxDiff = diff;
        bestColor = newColor;
      }
    }
    
    return bestColor || '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  };

  // 计算两个颜色之间的差异值
  const getColorDifference = (color1: string, color2: string): number => {
    // 将十六进制颜色转换为RGB
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    // 计算RGB值的差异
    const rDiff = Math.abs(rgb1.r - rgb2.r);
    const gDiff = Math.abs(rgb1.g - rgb2.g);
    const bDiff = Math.abs(rgb1.b - rgb2.b);
    
    // 返回差异的平方和（欧几里得距离的平方）
    return rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
  };

  // 计算一个颜色与颜色数组中所有颜色的最小差异
  const getMinColorDifference = (color: string, colors: string[]): number => {
    if (colors.length === 0) return 1000000; // 如果没有颜色，返回一个大值
    
    return Math.min(...colors.map(c => getColorDifference(color, c)));
  };

  // 将十六进制颜色转换为RGB对象
  const hexToRgb = (hex: string): {r: number, g: number, b: number} | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // 重新分配所有选项颜色
  const reassignAllColors = () => {
    // 创建一个可用颜色的副本
    const availableColors = [...predefinedColors];
    
    // 打乱颜色数组，确保随机性
    for (let i = availableColors.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableColors[i], availableColors[j]] = [availableColors[j], availableColors[i]];
    }
    
    // 为每个选项分配一个新颜色
    const updatedOptions = options.map((option, index) => {
      // 为每个选项选择一个颜色，尽量避免相邻选项颜色相似
      let newColor;
      
      // 如果还有预定义颜色，使用它
      if (index < availableColors.length) {
        newColor = availableColors[index];
      } else {
        // 如果预定义颜色用完了，生成一个随机颜色
        newColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      }
      
      return { ...option, color: newColor };
    });
    
    onOptionsChange(updatedOptions);
  };

  const [newOption, setNewOption] = useState<Partial<WheelOption>>({
    label: '',
    color: generateUniqueColor(),
    weight: 1
  });
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 计算总权重和百分比
  const totalWeight = options.reduce((sum, option) => sum + (option.weight || 1), 0);
  
  // 计算各选项的精确百分比
  const calculateExactPercentages = () => {
    // 先检查是否所有选项的权重都相同
    const allWeightsEqual = options.every(option => (option.weight || 1) === (options[0]?.weight || 1));
    
    // 如果所有权重相同，直接平均分配百分比
    if (allWeightsEqual && options.length > 0) {
      const evenPercentage = Math.floor(100 / options.length);
      const remainder = 100 - (evenPercentage * options.length);
      
      // 创建平均分配的结果
      const result: Record<string, number> = {};
      options.forEach((option, index) => {
        // 将余数加到最后一个选项上
        result[option.id] = index === options.length - 1 
          ? evenPercentage + remainder 
          : evenPercentage;
      });
      
      return result;
    }
    
    // 如果权重不同，则使用原来的计算逻辑
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
      color: newOption.color || generateUniqueColor(),
      weight: newOption.weight || 1
    };
    
    console.log('添加新选项:', option);
    onOptionsChange([...options, option]);
    setNewOption({
      label: '',
      color: generateUniqueColor(),
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
      <h3 className={styles.title}>Option List</h3>
      
      {options.length === 0 ? (
        <p className={styles.noOptions}>{t('noOptions')} {t('pleaseAdd')}</p>
      ) : (
        <table className={styles.optionsTable}>
          <thead>
            <tr>
              <th>{t('color')}</th>
              <th>{t('name')}</th>
              <th>{t('weight')}</th>
              <th>{t('operations')}</th>
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
                      {option.label || t('unnamedOption')}
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
                      {t('delete')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
      <div className={styles.addOptionForm}>
        <h4>{t('addNewOption')}</h4>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder={t('enterOptionName')}
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
          {t('add')}
        </button>
      </div>
      
      <div className={styles.buttonGroup}>
        <button 
          className={styles.resetButton}
          onClick={handleResetWeights}
        >
          {t('resetAllWeights')}
        </button>
        
        <button 
          className={styles.colorButton}
          onClick={reassignAllColors}
          title={t('reassignColors')}
        >
          {t('reassignColors')}
        </button>
      </div>
    </div>
  );
}; 