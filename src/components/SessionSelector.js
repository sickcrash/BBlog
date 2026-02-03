import React from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  padding-bottom: 8px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border};
`;

const Scroll = styled.ScrollView`
  padding-left: 16px;
`;

const Chip = styled.TouchableOpacity`
  background-color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.highlight};
  padding: 8px 16px;
  border-radius: 16px;
  margin-right: 8px;
`;

const ChipText = styled.Text`
  color: ${props => props.selected ? 'white' : props.theme.colors.text};
  font-weight: 600;
`;

const SESSIONS = ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Rest'];

export default function SessionSelector({ selectedSession, onSelect }) {
  return (
    <Container>
      <Scroll horizontal showsHorizontalScrollIndicator={false}>
        {SESSIONS.map((session) => (
          <Chip
            key={session}
            selected={selectedSession === session}
            onPress={() => onSelect(session)}
          >
            <ChipText selected={selectedSession === session}>{session}</ChipText>
          </Chip>
        ))}
      </Scroll>
    </Container>
  );
}
