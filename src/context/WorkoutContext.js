import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  const [programs, setPrograms] = useState(['Program 1']);
  const [currentProgram, setCurrentProgram] = useState('Program 1');
  const [calendarRanges, setCalendarRanges] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [programs, currentProgram, calendarRanges, isLoaded]);

  const loadData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('gymnotes_data');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setPrograms(parsed.programs || ['Program 1']);
        setCurrentProgram(parsed.currentProgram || 'Program 1');
        setCalendarRanges(parsed.calendarRanges || []);
      }
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
        calendarRanges,
      };
      await AsyncStorage.setItem('gymnotes_data', JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data", e);
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

  const saveLog = async (program, session, date, blocks) => {
    try {
      const key = `@Log_${program}_${session}_${date}`;
      const data = {
        blocks,
        lastModified: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(data));
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

  return (
    <WorkoutContext.Provider value={{
      programs,
      currentProgram,
      setCurrentProgram,
      calendarRanges,
      setCalendarRanges,
      addProgram,
      isLoaded,
      getLog,
      saveLog
    }}>
      {children}
    </WorkoutContext.Provider>
  );
};

export const useWorkout = () => useContext(WorkoutContext);
