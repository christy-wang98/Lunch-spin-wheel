import React from 'react';
import styled from 'styled-components';
import { SpinWheel } from '../components/SpinWheel/SpinWheel';
import { SpinWheelItem } from '../types/restaurant';

const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 30px;
  font-size: 2.5rem;
  text-align: center;
`;

const WheelSection = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

interface ResultContainerProps {
  $visible: boolean;
}

const ResultContainer = styled.div<ResultContainerProps>`
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  display: ${props => props.$visible ? 'block' : 'none'};
  text-align: center;
  width: 80%;
  max-width: 500px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ResultTitle = styled.h2`
  color: #4CAF50;
  margin-bottom: 10px;
`;

const ResultDescription = styled.p`
  margin-bottom: 20px;
  font-size: 1.1rem;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #45a049;
  }
`;

const ResetButton = styled(Button)`
  background-color: #f44336;
  
  &:hover {
    background-color: #d32f2f;
  }
`;

const demoItems: SpinWheelItem[] = [
  { id: '1', name: '川菜', color: '#FF6B6B' },
  { id: '2', name: '粤菜', color: '#4ECDC4' },
  { id: '3', name: '日料', color: '#45B7D1' },
  { id: '4', name: '西餐', color: '#96CEB4' },
  { id: '5', name: '火锅', color: '#FF9999' },
  { id: '6', name: '面食', color: '#9B59B6' },
  { id: '7', name: '快餐', color: '#3498DB' },
  { id: '8', name: '韩餐', color: '#E74C3C' },
];

export const Home: React.FC = () => {
  const [selectedItem, setSelectedItem] = React.useState<SpinWheelItem | null>(null);

  const handleSpinEnd = (item: SpinWheelItem) => {
    setSelectedItem(item);
    // 滚动到结果区域
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const handleViewRestaurants = () => {
    alert(`即将为您查找附近的${selectedItem?.name}餐厅！`);
    // 这里将来会集成地图API，显示附近的餐厅
  };

  const handleReset = () => {
    setSelectedItem(null);
    // 滚动回顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <HomeContainer>
      <Title>今天吃什么？</Title>
      <WheelSection>
        <SpinWheel items={demoItems} onSpinEnd={handleSpinEnd} />
      </WheelSection>
      <ResultContainer id="result-section" $visible={selectedItem !== null}>
        {selectedItem && (
          <>
            <ResultTitle>指针停在了: {selectedItem.name}</ResultTitle>
            <ResultDescription>
              根据转盘结果，今天推荐您尝试 <strong>{selectedItem.name}</strong>！
              <br />
              转盘已经为您做出了选择，不用再纠结啦！
            </ResultDescription>
            <ButtonContainer>
              <Button onClick={handleViewRestaurants}>
                查看附近的{selectedItem.name}餐厅
              </Button>
              <ResetButton onClick={handleReset}>
                重新转动
              </ResetButton>
            </ButtonContainer>
          </>
        )}
      </ResultContainer>
    </HomeContainer>
  );
}; 