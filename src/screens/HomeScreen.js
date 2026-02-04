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
  const { currentProgram, getLog, saveLog, getLastLog, sessionMap, sessions, setSessionForDate } = useWorkout();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [blocks, setBlocks] = useState([]);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const handleDateSelect = (dateString) => {
    setCurrentDate(new Date(dateString));
    setCalendarVisible(false);
  };

  useEffect(() => {
      // Look up session from sessionMap
      if (sessionMap && sessionMap[dateStr]) {
          setSelectedSession(sessionMap[dateStr]);
      } else {
          setSelectedSession(null);
      }
  }, [dateStr, sessionMap]);

  const handleSessionSelect = (session) => {
    if (session === selectedSession) {
        setSelectedSession(null);
        setSessionForDate(dateStr, null);
    } else {
        setSelectedSession(session);
        setSessionForDate(dateStr, session);
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
                           id: Date.now().toString() + Math.random().toString(), // Ensure new IDs
                           content: '',
                           placeholder: `Last: ${block.content || '...'}`
                       };
                   } else if (block.type === 'text') {
                       return {
                           ...block,
                           id: Date.now().toString() + Math.random().toString(),
                           content: '',
                           placeholder: block.content ? `Last note: ${block.content}` : 'Write a note...'
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
    // If no session selected, try to select default (first session)
    let sessionToUse = selectedSession;
    if (!sessionToUse && newBlocks.length > 0) {
        // Auto-select first session if available
        if (sessions && sessions.length > 0) {
            sessionToUse = sessions[0];
            // We do NOT set selectedSession here immediately to avoid race condition with loadLogs
        }
    }

    if (sessionToUse && currentProgram) {
        setBlocks(newBlocks);
        // Await saveLog to ensure storage is updated before any potential re-load triggers
        await saveLog(currentProgram, sessionToUse, dateStr, newBlocks);

        if (sessionToUse !== selectedSession) {
             setSelectedSession(sessionToUse);
             setSessionForDate(dateStr, sessionToUse);
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
