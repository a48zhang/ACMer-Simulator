import styled from 'styled-components';
import { Button } from '../common/Button';

const AttributesSection = styled.section`
  background-color: ${props => props.theme.colors.surface};
  padding: 0.875rem 1.25rem;
  border-radius: ${props => props.theme.radius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.textMain};
  font-weight: 700;
`;

const AttributePoints = styled.div`
  background: ${props => props.theme.colors.background};
  padding: 0.75rem 1rem;
  border-radius: ${props => props.theme.radius.md};
  margin-bottom: 1.25rem;
  border: 1px solid ${props => props.theme.colors.border};

  p {
    margin: 0;
    font-size: 0.9375rem;
    color: ${props => props.theme.colors.textMain};
    font-weight: 500;

    span {
      font-weight: 700;
      color: ${props => props.theme.colors.primary};
      font-size: 1.25rem;
    }
  }
`;

const AttributeGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    font-size: 0.9375rem;
    font-weight: 600;
    color: ${props => props.theme.colors.textMain};
    margin-bottom: 0.75rem;
  }
`;

const AttributesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
`;

const AttributeItem = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radius.md};
  padding: 0.875rem;
  border: 1px solid ${props => props.theme.colors.border};
`;

const AttributeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.625rem;
`;

const AttributeName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textMain};
`;

const AttributeValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
`;

const AttributeControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 0.5rem;
  background: ${props => props.theme.colors.border};
  border-radius: 9999px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  border-radius: 9999px;
  transition: width 0.2s ease;
  width: ${props => props.$width || '0%'};
`;

const SmallButton = styled(Button)`
  padding: 0.25rem 0.625rem;
  font-size: 0.875rem;
  min-width: 2rem;
`;

function AttributeAllocation({ attributes, availablePoints, onIncrease, onDecrease }) {
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

  const renderAttributeGroup = (attributeList, title) => (
    <AttributeGroup>
      <h3>{title}</h3>
      <AttributesGrid>
        {attributeList.map(({ key, name }) => (
          <AttributeItem key={key}>
            <AttributeHeader>
              <AttributeName>{name}</AttributeName>
              <AttributeValue>{attributes[key]}</AttributeValue>
            </AttributeHeader>
            <AttributeControls>
              <SmallButton
                variant="secondary"
                size="sm"
                onClick={() => onDecrease(key)}
              >
                -
              </SmallButton>
              <ProgressBar>
                <ProgressFill $width={`${attributes[key] * 10}%`} />
              </ProgressBar>
              <SmallButton
                variant="secondary"
                size="sm"
                onClick={() => onIncrease(key)}
              >
                +
              </SmallButton>
            </AttributeControls>
          </AttributeItem>
        ))}
      </AttributesGrid>
    </AttributeGroup>
  );

  return (
    <AttributesSection>
      <SectionTitle>属性点分配</SectionTitle>
      <AttributePoints>
        <p>可用属性点: <span>{availablePoints}</span></p>
      </AttributePoints>
      {renderAttributeGroup(generalAttributes, '通用属性')}
      {renderAttributeGroup(specializedAttributes, '专业属性')}
    </AttributesSection>
  );
}

export default AttributeAllocation;
