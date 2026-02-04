import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isSameDay } from 'date-fns';
import * as Updates from 'expo-updates';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  // Data Structure: [{ id: 'uuid', name: 'Name' }]
  const [programs, setPrograms] = useState([{ id: 'default_prog', name: 'Program 1' }]);
  const [currentProgram, setCurrentProgram] = useState('default_prog'); // ID
  const [sessions, setSessions] = useState([
      { id: 's1', name: 'Push' },
      { id: 's2', name: 'Pull' },
      { id: 's3', name: 'Legs' },
      { id: 's4', name: 'Upper' },
      { id: 's5', name: 'Lower' },
      { id: 's6', name: 'Full Body' },
      { id: 's7', name: 'Cardio' },
      { id: 's8', name: 'Rest' }
  ]);
  const [calendarRanges, setCalendarRanges] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [sessionMap, setSessionMap] = useState({}); // { 'yyyy-MM-dd': 'sessionId' }
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
      const storedData = await AsyncStorage.getItem('gymnotes_data_v2');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setPrograms(parsed.programs || [{ id: 'default_prog', name: 'Program 1' }]);
        setCurrentProgram(parsed.currentProgram || 'default_prog');
        setSessions(parsed.sessions || [
             { id: 's1', name: 'Push' },
             { id: 's2', name: 'Pull' },
             { id: 's3', name: 'Legs' },
             { id: 's4', name: 'Upper' },
             { id: 's5', name: 'Lower' },
             { id: 's6', name: 'Full Body' },
             { id: 's7', name: 'Cardio' },
             { id: 's8', name: 'Rest' }
        ]);
        setCalendarRanges(parsed.calendarRanges || []);
        setSessionMap(parsed.sessionMap || {});
      } else {
         // Check legacy? Assuming reset/fresh start for v2 as per "Reset" feature focus.
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
      await AsyncStorage.setItem('gymnotes_data_v2', JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const setSessionForDate = (date, sessionId) => {
      setSessionMap(prev => {
          const next = { ...prev };
          if (sessionId) {
              next[date] = sessionId;
          } else {
              delete next[date];
          }
          return next;
      });
  };

  const refreshMarkedDates = async () => {
    setMarkedDates({});
  };

  // Log Key: @Log_${programId}_${sessionId}_${date}
  const getLog = async (programId, sessionId, date) => {
    try {
      const key = `@Log_${programId}_${sessionId}_${date}`;
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

  const getLastLog = async (programId, sessionId, currentDateStr) => {
      try {
          const keys = await AsyncStorage.getAllKeys();
          const prefix = `@Log_${programId}_${sessionId}_`;

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

  const saveLog = async (programId, sessionId, date, blocks) => {
    try {
      // Logic 1-Day-1-Session: If switching session on same day, remove old log?
      // sessionMap handles "active" session.
      // We clean up if previous session different?
      const previousSessionId = sessionMap[date];
      if (previousSessionId && previousSessionId !== sessionId) {
          const oldKey = `@Log_${programId}_${previousSessionId}_${date}`;
          await AsyncStorage.removeItem(oldKey);
      }

      const newKey = `@Log_${programId}_${sessionId}_${date}`;
      const data = {
        blocks,
        lastModified: Date.now()
      };

      if (blocks.length > 0) {
          await AsyncStorage.setItem(newKey, JSON.stringify(data));
          setSessionForDate(date, sessionId);
      } else {
          await AsyncStorage.removeItem(newKey);
          // If purely empty, do we keep session assignment?
          // User wants "toggle". If I select, it stays.
          // So even if empty, we might want to keep the mapping if user explicitly selected it.
          // But here we are saving *blocks*.
          // setSessionForDate is also called from Home when clicking the button.
      }
    } catch (e) {
      console.error("Failed to save log", e);
    }
  };

  const addProgram = (name) => {
    const id = Date.now().toString();
    setPrograms([...programs, { id, name }]);
    setCurrentProgram(id);
  };

  const updateProgram = (id, newName) => {
      setPrograms(programs.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const deleteProgram = async (id) => {
      if (programs.length <= 1) return; // Prevent deleting last program?

      const newPrograms = programs.filter(p => p.id !== id);
      setPrograms(newPrograms);
      if (currentProgram === id) {
          setCurrentProgram(newPrograms[0].id);
      }

      // Cleanup Logs
      try {
          const keys = await AsyncStorage.getAllKeys();
          const prefix = `@Log_${id}_`;
          const toRemove = keys.filter(k => k.startsWith(prefix));
          if (toRemove.length > 0) {
              await AsyncStorage.multiRemove(toRemove);
          }
      } catch (e) {
          console.error("Delete program logs failed", e);
      }
  };

  const addSession = (name) => {
      const id = Date.now().toString();
      setSessions([...sessions, { id, name }]);
  };

  const updateSession = (id, newName) => {
      setSessions(sessions.map(s => s.id === id ? { ...s, name: newName } : s));
  };

  const deleteSession = async (id) => {
      try {
          // Remove from list
          const newSessions = sessions.filter(s => s.id !== id);
          setSessions([...newSessions]);

          // Remove from map
          setSessionMap(prev => {
              const next = { ...prev };
              Object.keys(next).forEach(date => {
                  if (next[date] === id) {
                      delete next[date];
                  }
              });
              return next;
          });

          // Remove logs
          const keys = await AsyncStorage.getAllKeys();
          const toRemove = [];

          // Filter logs containing this sessionId
          // Key: @Log_${programId}_${sessionId}_${date}
          // We can't strictly use prefix, need to match middle segment.
          // But we can iterate.

          const relevantKeys = keys.filter(key => {
               const parts = key.split('_');
               // parts[0] = @Log
               // parts[1] = programId
               // parts[2] = sessionId
               // parts[3] = date
               return parts.length >= 4 && parts[2] === id;
          });

          if (relevantKeys.length > 0) {
              await AsyncStorage.multiRemove(relevantKeys);
          }
      } catch (e) {
          console.error("Failed to delete session logs", e);
      }
  };

  const resetAllData = async () => {
      try {
          await AsyncStorage.clear();
          // Reset State
          setPrograms([{ id: 'default_prog', name: 'Program 1' }]);
          setCurrentProgram('default_prog');
          setSessions([
             { id: 's1', name: 'Push' },
             { id: 's2', name: 'Pull' },
             { id: 's3', name: 'Legs' },
             { id: 's4', name: 'Upper' },
             { id: 's5', name: 'Lower' },
             { id: 's6', name: 'Full Body' },
             { id: 's7', name: 'Cardio' },
             { id: 's8', name: 'Rest' }
          ]);
          setSessionMap({});
          setBlocks([]);

          try {
              await Updates.reloadAsync();
          } catch (e) {
              console.log("Expo Updates reload not available");
          }
      } catch (e) {
          console.error("Reset failed", e);
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
      deleteProgram,
      addSession,
      updateSession,
      deleteSession,
      setSessionForDate,
      isLoaded,
      getLog,
      saveLog,
      getLastLog,
      resetAllData
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
