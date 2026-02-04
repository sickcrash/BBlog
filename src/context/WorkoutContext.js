import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isSameDay } from 'date-fns';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [programs, setPrograms] = useState(['Program 1']);
  const [currentProgram, setCurrentProgram] = useState('Program 1');
  const [sessions, setSessions] = useState(['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Rest']);
  const [calendarRanges, setCalendarRanges] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [sessionMap, setSessionMap] = useState({}); // { 'yyyy-MM-dd': 'SessionName' }
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [programs, currentProgram, calendarRanges, sessions, sessionMap, isLoaded]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('gymnotes_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setPrograms(parsed.programs || ['Program 1']);
        setCurrentProgram(parsed.currentProgram || 'Program 1');
        setSessions(parsed.sessions || ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Rest']);
        setCalendarRanges(parsed.calendarRanges || []);
        setSessionMap(parsed.sessionMap || {});
      }
      await refreshMarkedDates();
    } catch (e) {
      console.error("Failed to load data", e);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveData = async () => {
    try {
      const data = {
        programs,
        currentProgram,
        sessions,
        calendarRanges,
        sessionMap
      };
      await AsyncStorage.setItem('gymnotes_data', JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const setSessionForDate = (date, sessionName) => {
      setSessionMap(prev => {
          const next = { ...prev };
          if (sessionName) {
              next[date] = sessionName;
          } else {
              delete next[date];
          }
          return next;
      });
  };

  const refreshMarkedDates = async () => {
    // With sessionMap, we can easily mark days.
    // Logic: If sessionMap has entry for date, it has a log?
    // Not necessarily, sessionMap tracks assignment.
    // We should check actual logs if we want "red dot".
    // But user asked to simplify calendar.
    // For now, let's keep markedDates as empty or minimal if not requested.
    // But we might need it for "Events".
    // I'll leave it empty/basic for now to comply with "Identico a iOS" clean look.
    setMarkedDates({});
  };

  const getLog = async (program, session, date) => {
    try {
      const key = `@Log_${program}_${session}_${date}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.blocks || [];
      }
      return [];
    } catch (e) {
      console.error("Failed to get log", e);
      return [];
    }
  };

  const getLastLog = async (program, session, currentDateStr) => {
      try {
          const keys = await AsyncStorage.getAllKeys();
          const prefix = `@Log_${program}_${session}_`;

          const relevantKeys = keys.filter(k => k.startsWith(prefix));

          const pastLogs = relevantKeys
              .map(k => {
                  const parts = k.split('_');
                  const date = parts[parts.length - 1];
                  return { key: k, date };
              })
              .filter(item => item.date < currentDateStr)
              .sort((a, b) => b.date.localeCompare(a.date));

          if (pastLogs.length > 0) {
              const stored = await AsyncStorage.getItem(pastLogs[0].key);
              if (stored) {
                  const parsed = JSON.parse(stored);
                  return parsed.blocks || [];
              }
          }
          return null;
      } catch (e) {
          console.error("Failed to get last log", e);
          return null;
      }
  };

  const saveLog = async (program, session, date, blocks) => {
    try {
      // Clean up conflicts? sessionMap handles the "truth" of which session is active.
      // But we should still probably clean up the file for the *old* session if we switched.
      // If sessionMap[date] != session, we are switching.
      // But `saveLog` is called with the *new* session.
      // We should check if there was a previous session mapped.

      const previousSession = sessionMap[date];
      if (previousSession && previousSession !== session) {
          const oldKey = `@Log_${program}_${previousSession}_${date}`;
          await AsyncStorage.removeItem(oldKey);
      }

      const newKey = `@Log_${program}_${session}_${date}`;
      const data = {
        blocks,
        lastModified: Date.now()
      };
      await AsyncStorage.setItem(newKey, JSON.stringify(data));

      // Update map
      setSessionForDate(date, session);

      if (blocks.length === 0) {
           await AsyncStorage.removeItem(newKey);
           // If empty, maybe remove from sessionMap?
           // "1-Day-1-Session" implies assignment. If I assign "Rest", blocks are empty.
           // So we keep the assignment even if empty.
      }

    } catch (e) {
      console.error("Failed to save log", e);
    }
  };

  const addProgram = (name) => {
    if (!programs.includes(name)) {
      setPrograms([...programs, name]);
      setCurrentProgram(name);
    }
  };

  const updateProgram = (oldName, newName) => {
      if (programs.includes(newName)) return;
      const newPrograms = programs.map(p => p === oldName ? newName : p);
      setPrograms(newPrograms);
      if (currentProgram === oldName) {
          setCurrentProgram(newName);
      }
  };

  const addSession = (name) => {
      let uniqueName = name;
      let counter = 1;
      while (sessions.includes(uniqueName)) {
          uniqueName = `${name} ${counter}`;
          counter++;
      }
      setSessions([...sessions, uniqueName]);
  };

  const updateSession = (oldName, newName) => {
      if (!newName.trim()) return;
      if (sessions.includes(newName) && newName !== oldName) return;

      const newSessions = sessions.map(s => s === oldName ? newName : s);
      setSessions(newSessions);

      // Update sessionMap
      const newMap = { ...sessionMap };
      Object.keys(newMap).forEach(date => {
          if (newMap[date] === oldName) {
              newMap[date] = newName;
          }
      });
      setSessionMap(newMap);
  };

  const deleteSession = async (name) => {
      try {
          // Remove from list
          const newSessions = sessions.filter(s => s !== name);
          setSessions([...newSessions]);

          // Remove from map
          setSessionMap(prev => {
              const next = { ...prev };
              Object.keys(next).forEach(date => {
                  if (next[date] === name) {
                      delete next[date];
                  }
              });
              return next;
          });

          // Remove logs
          const keys = await AsyncStorage.getAllKeys();
          const toRemove = [];
          // Also remove logs regardless of program to be safe, or iterate all programs
          // The key format is @Log_${program}_${session}_${date}
          // We can just search for `_${name}_` in the key but that might be risky if name is substring of program.
          // Better: Check splits.
          // Or stick to program iteration if we trust programs list.
          // Let's filter carefully.

          const relevantKeys = keys.filter(key => {
              // Check if key contains the session name in the correct position
              // Key: @Log_ProgramName_SessionName_Date
              // It's safer to use the prefix strategy if we know the program.
              // But what if program was deleted? (Likely logs cleaned then).
              // We will stick to iterating current programs.
              for (const prog of programs) {
                  if (key.startsWith(`@Log_${prog}_${name}_`)) return true;
              }
              return false;
          });

          if (relevantKeys.length > 0) {
              await AsyncStorage.multiRemove(relevantKeys);
          }
      } catch (e) {
          console.error("Failed to delete session logs", e);
      }
  };

  return (
    <WorkoutContext.Provider value={{
      programs,
      currentProgram,
      setCurrentProgram,
      sessions,
      markedDates,
      sessionMap,
      addProgram,
      updateProgram,
      addSession,
      updateSession,
      deleteSession,
      setSessionForDate,
      isLoaded,
      getLog,
      saveLog,
      getLastLog
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
