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
  const { programs, currentProgram, getLog, saveLog, getLastLog, sessionMap, setSessionForDate } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  // Derive sessions for current program
  const currentProgramData = programs.find(p => p.id === currentProgram);
  const sessions = currentProgramData ? currentProgramData.sessions : [];

  const handleDateSelect = (dateString) => {
    setCurrentDate(new Date(dateString));
    setCalendarVisible(false);
  };

  useEffect(() => {
      // Look up session from sessionMap
      const mapped = sessionMap[dateStr];
      if (mapped && mapped.programId === currentProgram && mapped.sessionId) {
          setSelectedSession(mapped.sessionId);
      } else {
          setSelectedSession(null);
      }
  }, [dateStr, sessionMap, currentProgram]);

  const handleSessionSelect = (sessionId) => {
    if (sessionId === selectedSession) {
        setSelectedSession(null);
        setSessionForDate(dateStr, null, null);
    } else {
        setSelectedSession(sessionId);
        setSessionForDate(dateStr, currentProgram, sessionId);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      if (selectedSession && currentProgram) {
        const loadedBlocks = await getLog(currentProgram, selectedSession, dateStr);
        if (loadedBlocks && loadedBlocks.length > 0) {
            setBlocks(loadedBlocks);
        } else {
            // Inheritance
            const lastBlocks = await getLastLog(currentProgram, selectedSession, dateStr);
            if (lastBlocks && lastBlocks.length > 0) {
                const inheritedBlocks = lastBlocks.map(block => {
                   if (block.type === 'exercise') {
                       return {
                           ...block,
                           id: Date.now().toString() + Math.random().toString(),
                           content: '', // Real content empty
                           title: block.title, // Copy title as real text
                           placeholder: `Last: ${block.content || '...'}`
                       };
                   } else if (block.type === 'text') {
                       return {
                           ...block,
                           id: Date.now().toString() + Math.random().toString(),
                           content: '',
                           placeholder: block.content ? `Last: ${block.content}` : 'Write a note...'
                       }
                   }
                   return { ...block, id: Date.now().toString() + Math.random().toString(), content: '' };
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

  const handleUpdateBlocks = async (newBlocks) => {
    let sessionToUseId = selectedSession;

    // If adding blocks without a selected session, try to default to first available
    if (!sessionToUseId && newBlocks.length > 0 && sessions.length > 0) {
        sessionToUseId = sessions[0].id;
    }

    if (sessionToUseId && currentProgram) {
        setBlocks(newBlocks);
        // Save
        await saveLog(currentProgram, sessionToUseId, dateStr, newBlocks);

        if (sessionToUseId !== selectedSession) {
             setSelectedSession(sessionToUseId);
             setSessionForDate(dateStr, currentProgram, sessionToUseId);
        }
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
        onSelect={handleSessionSelect}
      />
      <BlockList
        blocks={blocks}
        onUpdateBlocks={handleUpdateBlocks}
      />
      <CalendarModal
        visible={isCalendarVisible}
        onClose={() => setCalendarVisible(false)}
        onSelectDate={handleDateSelect}
        selectedDate={dateStr}
      />
      <ProgramModal
        visible={isProgramVisible}
        onClose={() => setProgramVisible(false)}
      />
    </Container>
  );
}
