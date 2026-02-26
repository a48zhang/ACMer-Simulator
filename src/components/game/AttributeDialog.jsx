import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../common/Button';

const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const DialogBox = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.radius.lg};
  padding: 1.5rem;
  box-shadow: ${props => props.theme.shadows.lg};
  border: 1px solid ${props => props.theme.colors.border};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const DialogTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.5rem;
`;

const DialogSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.25rem;
  font-size: 0.9375rem;
`;

const PointsDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.colors.background};
  padding: 0.875rem 1.25rem;
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 1.25rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const PointsLabel = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.textMain};
`;

const PointsCount = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const DialogContent = styled.div``;

const DialogCategory = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h3`
  font-size: 0.9375rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textMain};
  margin-bottom: 0.75rem;
`;

const AttrList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AttrRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.875rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  border: 1px solid ${props => props.theme.colors.border};
`;

const AttrName = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMain};
  font-weight: 500;
`;

const AttrControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const AttrButton = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: ${props => props.theme.radius.md};
  border: none;
  background: ${props => props.theme.colors.primary};
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: ${props => props.theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const AttrValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  min-width: 1.5rem;
  text-align: center;
`;

const DialogFooter = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
`;

function AttributeDialog({ onConfirm, initialPoints = 20 }) {
  const [availablePoints, setAvailablePoints] = useState(initialPoints);
  const [attributes, setAttributes] = useState({
    coding: 0,
    algorithm: 0,
    speed: 0,
    stress: 0,
    math: 0,
    dp: 0,
    graph: 0,
    dataStructure: 0,
    string: 0,
    search: 0,
    greedy: 0,
    geometry: 0
  });

  const generalAttributes = [
    { key: 'coding', name: '💻 编程能力' },
    { key: 'algorithm', name: '🧮 算法思维' },
    { key: 'speed', name: '🏃 速度' },
    { key: 'stress', name: '🧘 抗压能力' }
  ];

  const specializedAttributes = [
    { key: 'math', name: '📐 数学' },
    { key: 'dp', name: '🔄 动态规划' },
    { key: 'graph', name: '🕸️ 图论' },
    { key: 'dataStructure', name: '🗂️ 数据结构' },
    { key: 'string', name: '🔤 字符串' },
    { key: 'search', name: '🔍 搜索' },
    { key: 'greedy', name: '💡 贪心' },
    { key: 'geometry', name: '📏 计算几何' }
  ];

  const increaseAttribute = (key) => {
    if (availablePoints > 0) {
      setAttributes(prev => ({
        ...prev,
        [key]: prev[key] + 1
      }));
      setAvailablePoints(prev => prev - 1);
    }
  };

  const decreaseAttribute = (key) => {
    if (attributes[key] > 0) {
      setAttributes(prev => ({
        ...prev,
        [key]: prev[key] - 1
      }));
      setAvailablePoints(prev => prev + 1);
    }
  };

  const handleConfirm = () => {
    if (availablePoints === 0) {
      onConfirm(attributes);
    }
  };

  return (
    <DialogOverlay>
      <DialogBox>
        <DialogTitle>🎮 属性点分配</DialogTitle>
        <DialogSubtitle>请分配你的初始属性点以开始游戏</DialogSubtitle>

        <PointsDisplay>
          <PointsLabel>剩余属性点:</PointsLabel>
          <PointsCount>{availablePoints}</PointsCount>
        </PointsDisplay>

        <DialogContent>
          <DialogCategory>
            <CategoryTitle>通用属性</CategoryTitle>
            <AttrList>
              {generalAttributes.map(({ key, name }) => (
                <AttrRow key={key}>
                  <AttrName>{name}</AttrName>
                  <AttrControls>
                    <AttrButton
                      onClick={() => decreaseAttribute(key)}
                      disabled={attributes[key] === 0}
                    >
                      -
                    </AttrButton>
                    <AttrValue>{attributes[key]}</AttrValue>
                    <AttrButton
                      onClick={() => increaseAttribute(key)}
                      disabled={availablePoints === 0}
                    >
                      +
                    </AttrButton>
                  </AttrControls>
                </AttrRow>
              ))}
            </AttrList>
          </DialogCategory>

          <DialogCategory>
            <CategoryTitle>专业属性</CategoryTitle>
            <AttrList>
              {specializedAttributes.map(({ key, name }) => (
                <AttrRow key={key}>
                  <AttrName>{name}</AttrName>
                  <AttrControls>
                    <AttrButton
                      onClick={() => decreaseAttribute(key)}
                      disabled={attributes[key] === 0}
                    >
                      -
                    </AttrButton>
                    <AttrValue>{attributes[key]}</AttrValue>
                    <AttrButton
                      onClick={() => increaseAttribute(key)}
                      disabled={availablePoints === 0}
                    >
                      +
                    </AttrButton>
                  </AttrControls>
                </AttrRow>
              ))}
            </AttrList>
          </DialogCategory>
        </DialogContent>

        <DialogFooter>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={availablePoints > 0}
          >
            {availablePoints > 0 ? `还有 ${availablePoints} 点未分配` : '确认并开始游戏'}
          </Button>
        </DialogFooter>
      </DialogBox>
    </DialogOverlay>
  );
}

export default AttributeDialog;
