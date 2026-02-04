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
      const todayStr = format(new Date(), 'yyyy-MM-dd');

      // Process logs
      for (const key of logKeys) {
        const parts = key.split('_');
        const date = parts[parts.length - 1];

        const dataStr = await AsyncStorage.getItem(key);
        if (dataStr) {
           const data = JSON.parse(dataStr);
           if (data.blocks && data.blocks.length > 0) {
              if (!newMarked[date]) newMarked[date] = { dots: [] };
              // Avoid duplicate dots if multiple logs for same day
              if (!newMarked[date].dots.find(d => d.key === 'log')) {
                  newMarked[date].dots.push({ key: 'log', color: '#FF3B30' }); // Red for log
              }
           }
        }
      }

      // Handle Today
      if (!newMarked[todayStr]) newMarked[todayStr] = { dots: [] };
      if (!newMarked[todayStr].dots.find(d => d.key === 'today')) {
          newMarked[todayStr].dots.push({ key: 'today', color: '#007AFF' }); // Blue for today
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
          // We want to find Session where Program and Date match
          const pattern = `@Log_${program}_`;
          const suffix = `_${dateStr}`;

          const matchingKey = keys.find(k => k.startsWith(pattern) && k.endsWith(suffix));
          if (matchingKey) {
              // Extract session. Format: @Log_Program_Session_Date
              // But Session might contain underscores if we allow spaces -> usually spaces are preserved in keys if we just template string it?
              // Wait, `addSession` uses spaces. Keys will be `@Log_Program 1_Push_2023-01-01`.
              // Splitting by `_` might be ambiguous if program or session has `_`.
              // Assuming standard names without `_`.
              // Better extraction: remove prefix `@Log_${program}_` and suffix `_${dateStr}`.
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
      const key = `@Log_${program}_${session}_${date}`;
      const data = {
        blocks,
        lastModified: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));

      // Refresh marked dates efficiently?
      // For now calling full refresh is safer to sync everything.
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
          setSessions(prev => prev.filter(s => s !== name));

          // Remove logs
          const keys = await AsyncStorage.getAllKeys();
          // Filter keys containing `_${name}_` ?
          // Format: `@Log_${program}_${session}_${date}`.
          // Careful with partial matches e.g. "Push" vs "Push 2".
          // We should construct regex or careful split.

          const toRemove = keys.filter(k => {
              if (!k.startsWith('@Log_')) return false;
              const parts = k.split('_');
              // parts[0] = @Log
              // parts[1] = Program
              // parts[2]... might be session parts if session has underscores?
              // parts[last] = Date
              // If we assume no underscores in program/session names for now or just standard structure.
              // To be safe, we can try to reconstruct.
              // Actually, we know the structure.
              // Let's iterate programs? No, keys are all we have.

              // If we use `_` as separator, names shouldn't have `_`.
              // If they do, this is fragile.
              // But assuming default data:
              // @Log_Program 1_Push_2023...
              // Session is parts[2] if Program has no underscores.
              // Let's do a substring check surrounded by `_`.
              // `_${name}_`
              // But Program could end with name, or Date could start with name? No.
              // Safest: match `_${name}_` and verify position?
              // Given constraints, strict parsing is hard without knowing program names list.
              // But we can check if the key contains the session name segment.

              // Better: we can assume session is the *middle* part?
              // We have Program list.
              // We can filter keys that start with `@Log_${program}_${name}_`.
              // This is safer.
              for (const prog of programs) {
                  if (k.startsWith(`@Log_${prog}_${name}_`)) return true;
              }
              return false;
          });

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
