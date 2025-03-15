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
    const savedOptions = localStorage.getItem('wheelOptions');
    if (savedOptions) {
      try {
        return JSON.parse(savedOptions);
      } catch (e) {
        console.error('Error loading saved options:', e);
        return defaultOptions;
      }
    }
    return defaultOptions;
  };

  const [options, setOptions] = useState<WheelOption[]>(loadOptions);
  const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);

  // 当选项变化时，保存到本地存储
  useEffect(() => {
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
    </div>
  );
}

export default App;
