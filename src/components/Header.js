import React from 'react';
import { TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { format } from 'date-fns';
import { Check, ChevronDown } from 'lucide-react-native';
import { useWorkout } from '../context/WorkoutContext';

const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.background};
`;

const ProgramBadge = styled.TouchableOpacity`
  background-color: ${props => props.theme.colors.primary};
  padding: 8px 16px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const ProgramText = styled.Text`
  color: white;
  font-weight: 600;
  margin-right: 4px;
`;

const DateBadge = styled.View`
  background-color: ${props => props.theme.colors.highlight};
  padding: 8px 16px;
  border-radius: 20px;
  flex-direction: row;
  align-items: center;
`;

const DateText = styled.Text`
  color: ${props => props.theme.colors.secondary};
  font-weight: 600;
  margin-right: 8px;
`;

export default function Header({ onProgramPress, onDatePress, date }) {
  const { currentProgram } = useWorkout();
  const dateStr = format(date || new Date(), 'MMM d');

  return (
    <Container>
      <ProgramBadge onPress={onProgramPress}>
        <ProgramText>{currentProgram}</ProgramText>
        <ChevronDown size={16} color="white" />
      </ProgramBadge>

      <TouchableOpacity onPress={onDatePress}>
        <DateBadge>
          <DateText>{dateStr}</DateText>
          <Check size={16} color="#8E8E93" />
        </DateBadge>
      </TouchableOpacity>
    </Container>
  );
}
