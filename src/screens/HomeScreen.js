import React, { useState, useEffect } from 'react';
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
  const { currentProgram, getLog, saveLog, getLastLog } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const handleDateSelect = (dateString) => {
    setCurrentDate(new Date(dateString));
    setCalendarVisible(false);
  };

  useEffect(() => {
    const loadLogs = async () => {
      if (selectedSession && currentProgram) {
        const loadedBlocks = await getLog(currentProgram, selectedSession, dateStr);
        if (loadedBlocks && loadedBlocks.length > 0) {
            setBlocks(loadedBlocks);
        } else {
            // Try inheritance
            const lastBlocks = await getLastLog(currentProgram, selectedSession, dateStr);
            if (lastBlocks && lastBlocks.length > 0) {
                const inheritedBlocks = lastBlocks.map(block => {
                   if (block.type === 'exercise') {
                       return {
                           ...block,
                           content: '', // Clear content
                           placeholder: `Last: ${block.content || '...'}`
                       };
                   }
                   // For text blocks, maybe we don't copy? Or copy as empty?
                   // User said "list of exercises". Text blocks usually contextual.
                   // Let's copy them but empty.
                   return { ...block, content: '' };
                });
                setBlocks(inheritedBlocks);
            } else {
                setBlocks([]);
            }
        }
      } else {
        setBlocks([]);
      }
    };
    loadLogs();
  }, [currentProgram, selectedSession, dateStr]);

  const handleUpdateBlocks = (newBlocks) => {
    setBlocks(newBlocks);
    if (selectedSession && currentProgram) {
      saveLog(currentProgram, selectedSession, dateStr, newBlocks);
    }
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
      <BlockList
        blocks={blocks}
        onUpdateBlocks={handleUpdateBlocks}
      />
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
