import React, { useState, useEffect } from 'react';
import { SpinWheel } from './components/SpinWheel/SpinWheel';
import { OptionList } from './components/OptionList/OptionList';
import MapView from './components/MapView/MapView';
import { WheelOption } from './types/wheelOption';
import './App.css';
import { useTranslation } from 'react-i18next';

// Default options for the wheel
const defaultOptions: WheelOption[] = [
  { id: '1', label: 'Chinese Food', color: '#E53935', weight: 1 },
  { id: '2', label: 'Western Food', color: '#1E88E5', weight: 1 },
  { id: '3', label: 'Japanese Food', color: '#43A047', weight: 1 },
  { id: '4', label: 'Korean Food', color: '#FB8C00', weight: 1 },
  { id: '5', label: 'Fast Food', color: '#00ACC1', weight: 1 },
  { id: '6', label: 'BBQ', color: '#F4511E', weight: 1 },
  { id: '7', label: 'Lunch Box', color: '#FFC107', weight: 1 },
  { id: '8', label: 'Hot Pot', color: '#9C27B0', weight: 1 }
];

function App() {
  const { t } = useTranslation();

  // Load options from localStorage, or use defaults if none exist
  const loadOptions = (): WheelOption[] => {
    try {
      // For debugging, first output the current localStorage content
      const rawData = localStorage.getItem('wheelOptions');
      console.log('Raw localStorage data:', rawData);
      
      if (!rawData) {
        console.log('No saved options found, using defaults');
        return defaultOptions;
      }
      
      // Strictly validate each option
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
      
      // Check if each option has valid properties
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

  // Reset to default options
  const resetToDefaults = () => {
    localStorage.removeItem('wheelOptions');
    setOptions([...defaultOptions]);
    console.log('Reset to default options');
  };
  
  // Clear localStorage and force page refresh
  const forceReset = () => {
    localStorage.clear();
    console.log('Cleared all localStorage data');
    window.location.reload();
  };

  const [options, setOptions] = useState<WheelOption[]>(loadOptions);
  const [selectedOption, setSelectedOption] = useState<WheelOption | null>(null);

  // Check if options are valid, reset to defaults if invalid
  useEffect(() => {
    const hasInvalidOptions = options.some(option => 
      !option.label || typeof option.label !== 'string' || option.label.trim() === ''
    );
    
    if (options.length === 0 || hasInvalidOptions) {
      console.warn('Invalid options detected, resetting to defaults');
      resetToDefaults();
    }
  }, []);

  // Save options to localStorage when they change
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

  // Add restaurants to options
  const handleAddRestaurants = (restaurants: WheelOption[]) => {
    // 处理餐厅地址中的中文
    const processedRestaurants = restaurants.map(restaurant => {
      if (restaurant.metadata && restaurant.metadata.address) {
        return {
          ...restaurant,
          metadata: {
            ...restaurant.metadata,
            address: restaurant.metadata.address
              .replace('加拿大', ', Canada')
              .replace('加拿', '')
              .replace('加', '')
              .replace('拿', '')
              .replace('大', '')
          }
        };
      }
      return restaurant;
    });

    // Check for duplicate options
    const newOptions = processedRestaurants.filter(restaurant => 
      !options.some(option => option.label === restaurant.label)
    );

    if (newOptions.length > 0) {
      setOptions([...options, ...newOptions]);
    } else {
      alert('All restaurants are already in the options list!');
    }
  };

  return (
    <div className="app">
      <h1 className="title">Lunch Spin Wheel</h1>
      
      <div className="main-content">
        {/* Left - Option List */}
        <div className="left-sidebar">
          <OptionList 
            options={options}
            onOptionsChange={handleOptionsChange}
          />
        </div>
        
        {/* Center - Spin Wheel and Results */}
        <div className="center-column">
          <SpinWheel 
            items={options} 
            onSpinEnd={handleSpinEnd} 
          />
          
          {selectedOption && (
            <div className="result">
              <h2>Today's Choice</h2>
              <div 
                className="selected-option"
                style={{ backgroundColor: selectedOption.color }}
              >
                {selectedOption.label}
              </div>
              
              {/* Display restaurant details if available */}
              {selectedOption.metadata && (
                <div className="restaurant-details">
                  {selectedOption.metadata.address && (
                    <p className="restaurant-address">
                      {t('address')}: {selectedOption.metadata.address
                        .replace('加拿大', ', Canada')
                        .replace('加拿', '')
                        .replace('加', '')
                        .replace('拿', '')
                        .replace('大', '')
                      }
                    </p>
                  )}
                  {selectedOption.metadata.distance && (
                    <p className="restaurant-distance">
                      {t('distance')}: {(selectedOption.metadata.distance / 1000).toFixed(1)}km
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
              title="Reset All Options"
            >
              Reset All Options
            </button>
            
            <button
              className="force-reset-button"
              onClick={forceReset}
              title="Force Reset and Refresh"
            >
              Force Reset and Refresh
            </button>
          </div>
        </div>
        
        {/* Right - Map View */}
        <div className="right-sidebar">
          <MapView onAddRestaurants={handleAddRestaurants} />
        </div>
      </div>
    </div>
  );
}

export default App;
