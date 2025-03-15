import React, { useRef, useState, useCallback } from 'react';
import { SpinWheelProps } from '../../types/wheel';
import styles from './SpinWheel.module.css';

export const SpinWheel: React.FC<SpinWheelProps> = ({ options, onSpinEnd }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  // 确保至少有一个选项
  const validOptions = options.length > 0 ? options : [{ id: 'default', label: '添加选项', color: '#cccccc', weight: 1 }];

  // 计算总权重
  const totalWeight = validOptions.reduce((sum, option) => sum + (option.weight || 1), 0);
  
  // 计算每个选项的角度
  const calculateAngles = () => {
    const angles: { startAngle: number; endAngle: number; option: typeof validOptions[0] }[] = [];
    let currentAngle = 0;
    
    validOptions.forEach(option => {
      // 如果没有权重属性或权重为0，默认为1
      const weight = option.weight || 1;
      // 计算该选项占用的角度
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

  // 计算标签位置和样式的辅助函数
  const getLabelStyle = (startAngle: number, endAngle: number) => {
    // 计算扇形中间的角度
    const midAngle = (startAngle + endAngle) / 2;
    // 转换为弧度
    const midRad = (midAngle - 90) * Math.PI / 180; // -90度调整，使0度指向上方
    
    // 计算标签放置的半径距离（从中心点向外）
    const radius = 36; // 百分比距离，从中心点向外

    // 计算标签位置
    const left = 50 + Math.cos(midRad) * radius;
    const top = 50 + Math.sin(midRad) * radius;
    
    // 调整标签旋转角度，使标签垂直显示
    const labelRotation = midAngle; // 标签旋转角度，使其垂直于半径
    
    return {
      left: `${left}%`,
      top: `${top}%`,
      transform: `translate(-50%, -50%) rotate(${labelRotation + 90}deg)`, // +90度使文本垂直
    };
  };

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
            {validOptions[0].label}
          </span>
        </div>
        <div className={styles.pointer} />
        <button 
          className={styles.spinButton}
          onClick={spinWheel}
          disabled={true}
        >
          至少需要2个选项
        </button>
      </div>
    );
  }

  // 考虑权重渲染各个扇区
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
        {angles.map(({ startAngle, endAngle, option }, index) => {
          const angle = startAngle;
          const segmentAngle = endAngle - startAngle;
          
          // 创建扇形路径 - 使用SVG路径描述扇形
          const svgPath = createSectorPath(200, 200, 0, 0, 200, angle, segmentAngle);
          
          return (
            <div
              key={option.id}
              className={styles.wheelSection}
              style={{
                backgroundColor: option.color,
                clipPath: `path('${svgPath}')`,
                transform: 'none',
                width: '100%',
                height: '100%',
                left: '0',
                top: '0'
              }}
            >
              <span 
                className={styles.label}
                style={getLabelStyle(startAngle, endAngle)}
              >
                {option.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className={styles.pointer} />
      <button 
        className={styles.spinButton}
        onClick={spinWheel}
        disabled={isSpinning || validOptions.length <= 1}
      >
        {isSpinning ? '转动中...' : validOptions.length <= 1 ? '至少需要2个选项' : '开始转动'}
      </button>
    </div>
  );
};

// 创建扇形路径的辅助函数
function createSectorPath(cx: number, cy: number, startX: number, startY: number, radius: number, startAngle: number, arcAngle: number): string {
  // 转换角度为弧度
  const startRad = (startAngle - 90) * Math.PI / 180; // -90度调整，使0度在上方
  const endRad = (startAngle + arcAngle - 90) * Math.PI / 180;
  
  // 计算弧的终点
  const endX = cx + radius * Math.cos(endRad);
  const endY = cy + radius * Math.sin(endRad);
  
  // 计算弧的起点
  const startArcX = cx + radius * Math.cos(startRad);
  const startArcY = cy + radius * Math.sin(startRad);
  
  // 创建路径
  const largeArcFlag = arcAngle > 180 ? 1 : 0;
  
  // 从中心点到弧的起点，再沿弧到终点，然后返回中心点
  return `M ${cx},${cy} L ${startArcX},${startArcY} A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY} Z`;
} 