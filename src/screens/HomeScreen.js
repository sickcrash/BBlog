import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import styled from 'styled-components/native';
import { format } from 'date-fns';
import Header from '../components/Header';
import SessionSelector from '../components/SessionSelector';
import BlockList from '../components/BlockList';
import CalendarModal from '../components/CalendarModal';
import ProgramModal from '../components/ProgramModal';
import { useWorkout } from '../context/WorkoutContext';

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${props => props.theme.colors.background};
`;

export default function HomeScreen() {
  const [selectedSession, setSelectedSession] = useState(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [isProgramVisible, setProgramVisible] = useState(false);
  const { currentProgram } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const handleDateSelect = (dateString) => {
    setCurrentDate(new Date(dateString));
    setCalendarVisible(false);
  };

  return (
    <Container edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />
      <Header
        onProgramPress={() => setProgramVisible(true)}
        onDatePress={() => setCalendarVisible(true)}
        date={currentDate}
      />
      <SessionSelector
        selectedSession={selectedSession}
        onSelect={setSelectedSession}
      />
      <BlockList date={dateStr} />
      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={handleDateSelect}
      />
      <ProgramModal
        visible={isProgramVisible}
        onClose={() => setProgramVisible(false)}
      />
    </Container>
  );
}
