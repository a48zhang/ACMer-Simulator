import { useState } from 'react';
import styled from 'styled-components';

const PlayerPanelWrapper = styled.aside`
  width: 268px;
  background: #ffffff;
  border-right: 1px solid ${props => props.theme.colors.border};
  overflow-y: auto;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  color: ${props => props.theme.colors.textMain};

  ${props => props.$collapsed && `
    width: 40px;
  `}
`;

const PanelToggle = styled.div`
  padding: 0.5rem;
  text-align: center;
  cursor: pointer;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  background: ${props => props.theme.colors.background};
  font-size: 0.75rem;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.border};
  }
`;

const ToggleIcon = styled.span`
  display: inline-block;
`;

const PanelContent = styled.div`
  padding: 0.875rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  ${props => props.$collapsed && `
    display: none;
  `}
`;

const PanelSection = styled.div``;

const PanelTitle = styled.h3`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

const PlayerInfo = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0.65rem;
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  transition: border-color 0.15s;

  &:hover {
    border-color: #c7d2fe;
  }
`;

const InfoLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const InfoValue = styled.span`
  font-weight: 700;
  font-size: 0.875rem;
  color: ${props => props.theme.colors.primary};
`;

const BuffsDisplay = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
`;

const BuffItem = styled.span`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.radius.md};

  ${props => props.$warning && `
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  `}

  ${props => props.$danger && `
    color: ${props => props.theme.colors.danger};
    background: rgba(239, 68, 68, 0.1);
  `}
`;

const AttrCategory = styled.div`
  margin-bottom: 0.75rem;
  flex-shrink: 0;
`;

const CategoryLabel = styled.div`
  font-size: 0.63rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 700;
  padding-left: 2px;
`;

const AttrGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.35rem;
`;

const AttrCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  padding: 0.42rem 0.5rem;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: #eef2ff;
    border-color: #c7d2fe;
  }
`;

const AttrHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const AttrLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
`;

const AttrValueText = styled.span`
  font-size: 0.78rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textMain};
`;

const AttrProgressBg = styled.div`
  height: 3px;
  background: ${props => props.theme.colors.border};
  border-radius: 2px;
  overflow: hidden;
`;

const AttrProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  width: ${props => props.$width}%;

  ${props => props.$primary && `
    background: linear-gradient(90deg, ${props.theme.colors.primary}, #818cf8);
  `}

  ${props => props.$secondary && `
    background: linear-gradient(90deg, ${props.theme.colors.secondary}, #34d399);
  `}
`;

function PlayerPanel({
  attributes,
  balance,
  remainingAP,
  monthlyAP,
  san,
  rating,
  gpa,
  buffs
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const generalAttributes = [
    { key: 'coding', name: '💻 编程', short: '编程' },
    { key: 'algorithm', name: '🧠 思维', short: '思维' },
    { key: 'speed', name: '🏃 速度', short: '速度' },
    { key: 'stress', name: '🧘 抗压', short: '抗压' },
    { key: 'teamwork', name: '🤝 协作', short: '协作' },
    { key: 'english', name: '🌐 英语', short: '英语' }
  ];

  const specializedAttributes = [
    { key: 'math', name: '📐 数学', short: '数学' },
    { key: 'dp', name: '🔄 DP', short: 'DP' },
    { key: 'graph', name: '🕸️ 图论', short: '图论' },
    { key: 'dataStructure', name: '🗂️ 数据结构', short: '数据' },
    { key: 'string', name: '🔤 字符串', short: '字符串' },
    { key: 'search', name: '🔍 搜索', short: '搜索' },
    { key: 'greedy', name: '💡 贪心', short: '贪心' },
    { key: 'geometry', name: '📏 几何', short: '几何' }
  ];

  return (
    <PlayerPanelWrapper $collapsed={!isExpanded}>
      <PanelToggle onClick={() => setIsExpanded(!isExpanded)}>
        <ToggleIcon>{isExpanded ? '◀' : '▶'}</ToggleIcon>
      </PanelToggle>

      <PanelContent $collapsed={!isExpanded}>
        <PanelSection>
          <PanelTitle>我的状态</PanelTitle>
          <PlayerInfo>
            <InfoItem>
              <InfoLabel>余额</InfoLabel>
              <InfoValue>¥{balance}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>SAN值</InfoLabel>
              <InfoValue>{san}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Rating</InfoLabel>
              <InfoValue>{rating}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>GPA</InfoLabel>
              <InfoValue>{gpa.toFixed(2)}</InfoValue>
            </InfoItem>
            {buffs && (buffs.failedCourses > 0 || buffs.academicWarnings > 0) && (
              <BuffsDisplay>
                {buffs.failedCourses > 0 && (
                  <BuffItem $warning>📉 挂科×{buffs.failedCourses}</BuffItem>
                )}
                {buffs.academicWarnings > 0 && (
                  <BuffItem $danger>⚠️ 学业警告×{buffs.academicWarnings}</BuffItem>
                )}
              </BuffsDisplay>
            )}
          </PlayerInfo>
        </PanelSection>

        <PanelSection>
          <PanelTitle>我的属性</PanelTitle>

          <AttrCategory>
            <CategoryLabel>通用能力</CategoryLabel>
            <AttrGrid>
              {generalAttributes.map(({ key, name, short }) => (
                <AttrCard key={key}>
                  <AttrHeader>
                    <AttrLabel title={name}>{short}</AttrLabel>
                    <AttrValueText>{attributes[key]}</AttrValueText>
                  </AttrHeader>
                  <AttrProgressBg>
                    <AttrProgressFill
                      $primary
                      $width={Math.min(attributes[key] * 10, 100)}
                    />
                  </AttrProgressBg>
                </AttrCard>
              ))}
            </AttrGrid>
          </AttrCategory>

          <AttrCategory>
            <CategoryLabel>专业知识</CategoryLabel>
            <AttrGrid>
              {specializedAttributes.map(({ key, name, short }) => (
                <AttrCard key={key}>
                  <AttrHeader>
                    <AttrLabel title={name}>{short}</AttrLabel>
                    <AttrValueText>{attributes[key]}</AttrValueText>
                  </AttrHeader>
                  <AttrProgressBg>
                    <AttrProgressFill
                      $secondary
                      $width={Math.min(attributes[key] * 10, 100)}
                    />
                  </AttrProgressBg>
                </AttrCard>
              ))}
            </AttrGrid>
          </AttrCategory>
        </PanelSection>
      </PanelContent>
    </PlayerPanelWrapper>
  );
}

export default PlayerPanel;
