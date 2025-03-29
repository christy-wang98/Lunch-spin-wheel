import React, { useState, useEffect } from 'react';
import { SpinWheel } from './components/SpinWheel/SpinWheel';
import { OptionList } from './components/OptionList/OptionList';
import MapView from './components/MapView/MapView';
import { WheelOption } from './types/wheel';
import './App.css';

// 初始默认选项
const defaultOptions: WheelOption[] = [
  { id: '1', label: '中餐', color: '#E53935', weight: 1 },
  { id: '2', label: '西餐', color: '#1E88E5', weight: 1 },
  { id: '3', label: '日料', color: '#43A047', weight: 1 },
  { id: '4', label: '韩餐', color: '#FB8C00', weight: 1 },
  { id: '5', label: '快餐', color: '#00ACC1', weight: 1 },
  { id: '6', label: '烧烤', color: '#F4511E', weight: 1 },
  { id: '7', label: '便当', color: '#FFC107', weight: 1 },
  { id: '8', label: '火锅', color: '#9C27B0', weight: 1 }
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

  // 添加餐厅到选项
  const handleAddRestaurants = (restaurants: WheelOption[]) => {
    // 检查是否有重复的选项
    const newOptions = restaurants.filter(restaurant => 
      !options.some(option => option.label === restaurant.label)
    );

    if (newOptions.length > 0) {
      setOptions([...options, ...newOptions]);
    } else {
      alert('所有餐厅都已经在选项中了！');
    }
  };

  return (
    <div className="app">
      <h1 className="title">午餐大转盘</h1>
      
      <div className="main-content">
        {/* 左侧 - 选项列表 */}
        <div className="left-sidebar">
          <OptionList 
            options={options}
            onOptionsChange={handleOptionsChange}
          />
        </div>
        
        {/* 中间 - 转盘和结果 */}
        <div className="center-column">
          <SpinWheel 
            options={options} 
            onSpinEnd={handleSpinEnd} 
          />
          
          {selectedOption && (
            <div className="result">
              <h2>今天吃这个！</h2>
              <div 
                className="selected-option"
                style={{ backgroundColor: selectedOption.color }}
              >
                {selectedOption.label}
              </div>
              
              {/* 显示餐厅详细信息（如果有） */}
              {selectedOption.metadata && (
                <div className="restaurant-details">
                  {selectedOption.metadata.address && (
                    <p className="restaurant-address">
                      地址：{selectedOption.metadata.address}
                    </p>
                  )}
                  {selectedOption.metadata.distance && (
                    <p className="restaurant-distance">
                      距离：{(selectedOption.metadata.distance / 1000).toFixed(1)}km
                    </p>
                  )}
                </div>
              )}
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
        
        {/* 右侧 - 地图 */}
        <div className="right-sidebar">
          <MapView onAddRestaurants={handleAddRestaurants} />
        </div>
      </div>
    </div>
  );
}

export default App;
