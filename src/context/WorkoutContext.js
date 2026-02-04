import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';

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

      for (const key of logKeys) {
        const parts = key.split('_');
        const date = parts[parts.length - 1];

        const dataStr = await AsyncStorage.getItem(key);
        if (dataStr) {
           const data = JSON.parse(dataStr);
           if (data.blocks && data.blocks.length > 0) {
              newMarked[date] = { marked: true, dotColor: '#007AFF' };
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

  const saveLog = async (program, session, date, blocks) => {
    try {
      const key = `@Log_${program}_${session}_${date}`;
      const data = {
        blocks,
        lastModified: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));

      if (blocks.length > 0) {
          setMarkedDates(prev => ({
              ...prev,
              [date]: { marked: true, dotColor: '#007AFF' }
          }));
      } else {
          setMarkedDates(prev => {
              const next = { ...prev };
              delete next[date];
              return next;
          });
          if (blocks.length === 0) {
              await AsyncStorage.removeItem(key);
          }
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
  };

  const deleteSession = (name) => {
      setSessions(sessions.filter(s => s !== name));
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
      getLastLog
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
