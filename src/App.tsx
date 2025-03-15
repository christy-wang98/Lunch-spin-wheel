import React, { useState, useEffect } from 'react';
import { SpinWheel } from './components/SpinWheel/SpinWheel';
import { OptionList } from './components/OptionList/OptionList';
import { WheelOption } from './types/wheel';
import './App.css';

// 初始默认选项
const defaultOptions: WheelOption[] = [
  { id: '1', label: '中餐', color: '#e74c3c', weight: 1 },
  { id: '2', label: '西餐', color: '#8e44ad', weight: 1 },
  { id: '3', label: '日料', color: '#3498db', weight: 1 },
  { id: '4', label: '韩餐', color: '#9b59b6', weight: 1 },
  { id: '5', label: '快餐', color: '#2ecc71', weight: 1 },
  { id: '6', label: '烧烤', color: '#e67e22', weight: 1 },
  { id: '7', label: '便当', color: '#f1c40f', weight: 1 },
  { id: '8', label: '火锅', color: '#7f8c8d', weight: 1 }
];

function App() {
  // 从本地存储加载选项，如果没有则使用默认选项
  const loadOptions = (): WheelOption[] => {
    try {
      // 为了调试，先输出当前本地存储的内容
      const rawData = localStorage.getItem('wheelOptions');
      console.log('Raw localStorage data:', rawData);
      
      if (!rawData) {
        console.log('No saved options found, using defaults');
        return defaultOptions;
      }
      
      // 严格验证每个选项
      const parsedOptions = JSON.parse(rawData);
      console.log('Parsed options:', parsedOptions);
      
      if (!Array.isArray(parsedOptions)) {
        console.warn('Saved options is not an array, using defaults');
        return defaultOptions;
      }
      
      if (parsedOptions.length === 0) {
        console.warn('Saved options is empty, using defaults');
        return defaultOptions;
      }
      
      // 检查每个选项是否有有效的属性
      const validOptions = parsedOptions.filter(option => {
        const isValid = 
          option && 
          typeof option === 'object' &&
          option.id && 
          option.label && 
          typeof option.label === 'string' &&
          option.label.trim() !== '' &&
          option.color;
        
        if (!isValid) {
          console.warn('Found invalid option:', option);
        }
        
        return isValid;
      });
      
      console.log('Valid options after filtering:', validOptions);
      
      if (validOptions.length === 0) {
        console.warn('No valid options found after filtering, using defaults');
        return defaultOptions;
      }
      
      return validOptions;
    } catch (e) {
      console.error('Error loading saved options:', e);
      return defaultOptions;
    }
  };

  // 重置为默认选项
  const resetToDefaults = () => {
    localStorage.removeItem('wheelOptions');
    setOptions([...defaultOptions]);
    console.log('Reset to default options');
  };
  
  // 完全清除本地存储并强制刷新页面
  const forceReset = () => {
    localStorage.clear();
    console.log('Cleared all localStorage data');
    window.location.reload();
  };

  const [options, setOptions] = useState<WheelOption[]>(loadOptions);
  const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);

  // 检查选项是否有效，如果无效则重置为默认值
  useEffect(() => {
    const hasInvalidOptions = options.some(option => 
      !option.label || typeof option.label !== 'string' || option.label.trim() === ''
    );
    
    if (options.length === 0 || hasInvalidOptions) {
      console.warn('Invalid options detected, resetting to defaults');
      resetToDefaults();
    }
  }, []);

  // 当选项变化时，保存到本地存储
  useEffect(() => {
    console.log('Saving options to localStorage:', options);
    localStorage.setItem('wheelOptions', JSON.stringify(options));
  }, [options]);

  const handleSpinEnd = (option: WheelOption) => {
    setSelectedOption(option);
  };

  const handleOptionsChange = (newOptions: WheelOption[]) => {
    setOptions(newOptions);
  };

  return (
    <div className="app">
      <h1 className="title">午餐大转盘</h1>
      
      <div className="content">
        <SpinWheel 
          options={options} 
          onSpinEnd={handleSpinEnd} 
        />
        
        <OptionList 
          options={options}
          onOptionsChange={handleOptionsChange}
        />
      </div>
      
      {selectedOption && (
        <div className="result">
          <h2>今天吃这个！</h2>
          <div 
            className="selected-option"
            style={{ backgroundColor: selectedOption.color }}
          >
            {selectedOption.label}
          </div>
        </div>
      )}
      
      <div className="buttons-container">
        <button
          className="reset-button"
          onClick={resetToDefaults}
          title="重置所有选项为默认值"
        >
          重置所有选项
        </button>
        
        <button
          className="force-reset-button"
          onClick={forceReset}
          title="清除所有数据并刷新页面"
        >
          强制重置并刷新
        </button>
      </div>
    </div>
  );
}

export default App;
