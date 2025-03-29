import React, { useRef, useState, useCallback } from 'react';
import { WheelOption } from '../../types/wheelOption';
import styles from './SpinWheel.module.css';
import { useTranslation } from 'react-i18next';

// 预定义一组彩虹色谱的颜色
const predefinedColors = [
  // 基础彩虹色
  '#FF0000', // 红
  '#FF7F00', // 橙
  '#FFFF00', // 黄
  '#00FF00', // 绿
  '#00FFFF', // 青
  '#0000FF', // 蓝
  '#8B00FF', // 紫
  // 深色变体
  '#8B0000', // 深红
  '#FF4500', // 深橙
  '#FFD700', // 金黄
  '#006400', // 深绿
  '#008B8B', // 深青
  '#000080', // 深蓝
  '#4B0082', // 靛紫
  // 浅色/其他变体
  '#FF69B4', // 粉红
  '#98FB98', // 浅绿
  '#87CEEB', // 天蓝
  '#DDA0DD', // 梅红
  '#F0E68C', // 卡其
  '#E6E6FA', // 淡紫
];

// 获取不重复的颜色
const getDistributedColors = (count: number): string[] => {
  const result: string[] = [];
  let baseColors = [...predefinedColors];
  
  // 首先使用基础彩虹色（前7个颜色）
  const rainbowColors = baseColors.slice(0, 7);
  const otherColors = baseColors.slice(7);
  
  // 打乱其他颜色的顺序
  for (let i = otherColors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [otherColors[i], otherColors[j]] = [otherColors[j], otherColors[i]];
  }
  
  // 如果数量小于等于7，只使用彩虹色
  if (count <= 7) {
    return rainbowColors.slice(0, count);
  }
  
  // 否则先使用所有彩虹色，然后依次使用其他颜色
  result.push(...rainbowColors);
  
  // 填充剩余的位置
  for (let i = 7; i < count; i++) {
    if (i < baseColors.length) {
      result.push(otherColors[i - 7]);
    } else {
      // 如果还需要更多颜色，确保不与相邻的重复
      let availableColors = baseColors.filter(c => c !== result[i - 1]);
      if (availableColors.length === 0) {
        availableColors = baseColors;
      }
      const randomIndex = Math.floor(Math.random() * availableColors.length);
      result.push(availableColors[randomIndex]);
    }
  }
  
  return result;
};

interface SpinWheelProps {
  items: WheelOption[];
  onSpinEnd?: (option: WheelOption) => void;
}

// 截取餐厅名称，保留核心信息
const truncateLabel = (label: string): string => {
  // 移除常见后缀和括号内容
  let name = label
    .replace(/餐厅|餐馆|小吃|外卖|店$/g, '')
    .replace(/\(.*?\)/g, '')
    .trim();
  
  // 如果是英文名，只保留前3个字母
  if (/^[A-Za-z\s]+$/.test(name)) {
    name = name.replace(/\s+/g, '').slice(0, 3);
    return name.toUpperCase() + '...';
  }
  
  // 如果是中文名，只保留前2个字
  return name.slice(0, 2) + '...';
};

// 计算文字大小
const calculateFontSize = (text: string, arcLength: number): number => {
  // 减小基础字体大小
  const baseFontSize = 4;
  // 每个字符的平均宽度（假设为字体大小的0.8倍）
  const charWidth = baseFontSize * 0.8;
  // 文本总宽度
  const textWidth = text.length * charWidth;
  // 可用弧长（考虑边距）
  const availableLength = arcLength * 0.7;
  
  if (textWidth > availableLength) {
    // 如果文本太长，缩小字体，但不小于3
    return Math.max(3, (availableLength / text.length) / 0.8);
  }
  return baseFontSize;
};

// Update button text to include spaces and capitalize
const resetAllWeightsButton = "Reset All Weights";
const reassignColorsButton = "Reassign Colors";

export const SpinWheel: React.FC<SpinWheelProps> = ({ items: options, onSpinEnd }) => {
  const { t } = useTranslation();
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // 确保至少有一个选项
  const validOptions = options.length > 0 ? options : [{ id: 'default', label: '添加选项', color: '#cccccc', weight: 1 }];

  // 分配颜色
  const distributedColors = getDistributedColors(validOptions.length);
  const optionsWithColors = validOptions.map((option, index) => ({
    ...option,
    color: option.color || distributedColors[index],
  }));

  // 计算总权重
  const totalWeight = optionsWithColors.reduce((sum, option) => sum + (option.weight || 1), 0);
  
  // 计算每个选项的角度
  const calculateAngles = () => {
    const angles: { startAngle: number; endAngle: number; option: typeof optionsWithColors[0] }[] = [];
    let currentAngle = 0;
    
    optionsWithColors.forEach(option => {
      const weight = option.weight || 1;
      const angle = (weight / totalWeight) * 360;
      
      angles.push({
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        option
      });
      
      currentAngle += angle;
    });
    
    return angles;
  };

  const getRandomSpin = () => {
    const minSpins = 5;
    const maxSpins = 10;
    const randomSpins = minSpins + Math.random() * (maxSpins - minSpins);
    const extraAngle = Math.random() * 360;
    return randomSpins * 360 + extraAngle;
  };

  const spinWheel = useCallback(() => {
    if (isSpinning || validOptions.length <= 1) return;

    setIsSpinning(true);
    const spinDuration = 4000;
    const totalRotation = getRandomSpin();
    const newRotation = rotation + totalRotation;
    setRotation(newRotation);

    setTimeout(() => {
      const finalAngle = newRotation % 360;
      // 计算最终指针指向的角度 (反方向)
      const pointerAngle = (360 - finalAngle) % 360;
      
      // 根据最终角度确定选中的选项
      const angles = calculateAngles();
      const selectedOption = angles.find(
        angle => pointerAngle >= angle.startAngle && pointerAngle < angle.endAngle
      )?.option || validOptions[0];
      
      setIsSpinning(false);
      if (onSpinEnd) {
        onSpinEnd(selectedOption);
      }
    }, spinDuration);
  }, [isSpinning, validOptions, onSpinEnd, rotation, totalWeight]);

  // 如果只有一个选项，显示满圆
  if (validOptions.length === 1) {
    return (
      <div className={styles.wheelContainer}>
        <div 
          ref={wheelRef}
          className={styles.wheel}
          style={{
            backgroundColor: validOptions[0].color,
          }}
        >
          <span 
            className={styles.singleLabel}
          >
            {t('addOption')}
          </span>
        </div>
        <div className={styles.pointer} />
        <button 
          className={styles.spinButton}
          onClick={spinWheel}
          disabled={true}
        >
          {t('needTwoOptions')}
        </button>
      </div>
    );
  }

  // 计算各个扇区
  const angles = calculateAngles();

  return (
    <div className={styles.wheelContainer}>
      <div 
        ref={wheelRef}
        className={styles.wheel}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: isSpinning 
            ? `transform ${4}s cubic-bezier(0.2, 0.8, 0.2, 1)` 
            : 'none',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            borderRadius: '50%',
          }}
        >
          <defs>
            {/* 添加投影效果 */}
            <filter id="textShadow">
              <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="rgba(0,0,0,0.5)"/>
            </filter>
          </defs>
          {angles.map(({ startAngle, endAngle, option }, index) => {
            const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
            
            // 计算圆弧的起点和终点
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const startX = 50 + 50 * Math.cos(startRad);
            const startY = 50 + 50 * Math.sin(startRad);
            const endX = 50 + 50 * Math.cos(endRad);
            const endY = 50 + 50 * Math.sin(endRad);
            
            // 构建SVG路径
            const path = [
              `M 50 50`,
              `L ${startX} ${startY}`,
              `A 50 50 0 ${largeArcFlag} 1 ${endX} ${endY}`,
              'Z'
            ].join(' ');
            
            // 计算文本位置和大小
            const midAngle = (startAngle + endAngle) / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const textDistance = 40; // 增加文字到中心的距离，让文字更靠外
            const textX = 50 + textDistance * Math.cos(midRad);
            const textY = 50 + textDistance * Math.sin(midRad);
            
            // 计算扇区弧长
            const arcLength = (endAngle - startAngle) * Math.PI / 180 * textDistance;
            // 获取截断后的文本
            const truncatedText = truncateLabel(option.label);
            // 计算适合的字体大小
            const fontSize = calculateFontSize(truncatedText, arcLength);

            return (
              <g key={option.id}>
                <path
                  d={path}
                  fill={option.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
                {/* 添加扇区悬停效果 */}
                <path
                  d={path}
                  fill="transparent"
                  className={styles.hoverArea}
                >
                  <title>{option.label}</title>
                </path>
                <g transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}>
                  <text
                    x={textX}
                    y={textY}
                    fill="white"
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight="bold"
                    filter="url(#textShadow)"
                    style={{
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    {truncatedText}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
      <div className={styles.pointer} />
      <button 
        className={styles.spinButton}
        onClick={spinWheel}
        disabled={isSpinning || validOptions.length <= 1}
      >
        {isSpinning ? t('spinning') : validOptions.length <= 1 ? t('needTwoOptions') : t('spin')}
      </button>
    </div>
  );
}; 