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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [programs, currentProgram, calendarRanges, sessions, isLoaded]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('gymnotes_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setPrograms(parsed.programs || ['Program 1']);
        setCurrentProgram(parsed.currentProgram || 'Program 1');
        setSessions(parsed.sessions || ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'Full Body', 'Cardio', 'Rest']);
        setCalendarRanges(parsed.calendarRanges || []);
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
      };
      await AsyncStorage.setItem('gymnotes_data', JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const refreshMarkedDates = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const logKeys = keys.filter(k => k.startsWith('@Log_'));
      const newMarked = {};

      // Process logs
      for (const key of logKeys) {
        const parts = key.split('_');
        const date = parts[parts.length - 1];

        const dataStr = await AsyncStorage.getItem(key);
        if (dataStr) {
           const data = JSON.parse(dataStr);
           if (data.blocks && data.blocks.length > 0) {
              if (!newMarked[date]) newMarked[date] = { dots: [] };
              if (!newMarked[date].dots.find(d => d.key === 'log')) {
                  newMarked[date].dots.push({ key: 'log', color: '#FF3B30' }); // Red for log
              }
           }
        }
      }
      setMarkedDates(newMarked);
    } catch (e) {
      console.error("Failed to refresh marked dates", e);
    }
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

  const getSessionForDate = async (program, dateStr) => {
      try {
          const keys = await AsyncStorage.getAllKeys();
          // Keys are @Log_Program_Session_Date
          const pattern = `@Log_${program}_`;
          const suffix = `_${dateStr}`;

          const matchingKey = keys.find(k => k.startsWith(pattern) && k.endsWith(suffix));
          if (matchingKey) {
              // Extract session.
              // Logic: key = pattern + SESSION + suffix
              const mid = matchingKey.substring(pattern.length, matchingKey.length - suffix.length);
              return mid;
          }
          return null;
      } catch (e) {
          console.error("Failed to get session for date", e);
          return null;
      }
  };

  const saveLog = async (program, session, date, blocks) => {
    try {
      // 1-Day-1-Session Logic: Ensure no other session exists for this Program+Date
      const allKeys = await AsyncStorage.getAllKeys();
      const pattern = `@Log_${program}_`;
      const suffix = `_${date}`;

      const conflictingKeys = allKeys.filter(k =>
          k.startsWith(pattern) && k.endsWith(suffix)
      );

      // We expect 0 or 1 matching key (if session is same).
      // But if session is DIFFERENT, we must remove it.
      // E.g. existing key: @Log_P1_Push_2023-01-01
      // New save: @Log_P1_Pull_2023-01-01
      // We remove the Push key.

      const newKey = `@Log_${program}_${session}_${date}`;
      const toDelete = conflictingKeys.filter(k => k !== newKey);

      if (toDelete.length > 0) {
          await AsyncStorage.multiRemove(toDelete);
      }

      const data = {
        blocks,
        lastModified: Date.now()
      };
      await AsyncStorage.setItem(newKey, JSON.stringify(data));

      // Also, if blocks is empty, maybe we should delete the key too?
      // "La funzione per aggiungere esercizi e note si è rotta" -> user might be saving empty list?
      // Assuming blocks not empty usually.
      if (blocks.length === 0) {
           await AsyncStorage.removeItem(newKey);
      }

      refreshMarkedDates();

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
  };

  const deleteSession = async (name) => {
      try {
          // Remove from list
          const newSessions = sessions.filter(s => s !== name);
          setSessions(newSessions);

          // Force save sessions immediately (though useEffect handles it if sessions changes)
          // But cleaning storage needs to happen.

          // Remove logs
          const keys = await AsyncStorage.getAllKeys();

          // Filter keys that match the session name segment.
          // Using loop over programs to be precise.
          const toRemove = [];
          for (const prog of programs) {
             const prefix = `@Log_${prog}_${name}_`;
             // This prefix handles keys starting with it.
             // We need to match keys that START with this.
             const matched = keys.filter(k => k.startsWith(prefix));
             toRemove.push(...matched);
          }

          if (toRemove.length > 0) {
              await AsyncStorage.multiRemove(toRemove);
          }

          refreshMarkedDates();
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
      addProgram,
      updateProgram,
      addSession,
      updateSession,
      deleteSession,
      isLoaded,
      getLog,
      saveLog,
      getLastLog,
      getSessionForDate
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
