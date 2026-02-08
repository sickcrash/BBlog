import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isSameDay } from 'date-fns';
import * as Updates from 'expo-updates';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
  // Data Structure:
  // programs: [ { id, name, sessions: [ { id, name } ] } ]
  // currentProgram: id
  // sessionMap: { dateString: { programId, sessionId } }

  const [programs, setPrograms] = useState([]);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
  const [sessionMap, setSessionMap] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData();
    }
  }, [programs, currentProgram, sessionMap, isLoaded]);

  const loadData = async () => {
    try {
      if (__DEV__) {
          // Dev Wipe as requested
          console.log("DEV MODE: Clearing AsyncStorage...");
          await AsyncStorage.clear();
      }

      const storedData = await AsyncStorage.getItem('gymnotes_data_v3');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setPrograms(parsed.programs || []);
        setCurrentProgram(parsed.currentProgram || null);
        setSessionMap(parsed.sessionMap || {});
      } else {
        // Initialize default data if empty (or after wipe)
        const defaultProgId = 'prog_' + Date.now();
        const defaultSessions = [
             { id: 'sess_' + Date.now() + '_1', name: 'Push' },
             { id: 'sess_' + Date.now() + '_2', name: 'Pull' },
             { id: 'sess_' + Date.now() + '_3', name: 'Legs' }
        ];
        const defaultProg = { id: defaultProgId, name: 'Program 1', sessions: defaultSessions };
        setPrograms([defaultProg]);
        setCurrentProgram(defaultProgId);
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
        sessionMap
      };
      await AsyncStorage.setItem('gymnotes_data_v3', JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  const setSessionForDate = (date, programId, sessionId) => {
      setSessionMap(prev => {
          const next = { ...prev };
          if (programId && sessionId) {
              next[date] = { programId, sessionId };
          } else {
              delete next[date];
          }
          return next;
      });
  };

  const refreshMarkedDates = async () => {
    setMarkedDates({});
  };

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
              .filter(item => item.date < currentDateStr) // Strictly past
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
      // 1-Day-1-Session Logic
      // If we are saving a log for a date, we set this as the active session.
      // If there was another session active, we might want to clear it?
      // But the map handles the pointer. The old log file remains but is "detached" from the date in UI.
      // Actually, to keep storage clean, we could delete the old log if it differs.

      const prev = sessionMap[date];
      if (prev && (prev.programId !== programId || prev.sessionId !== sessionId)) {
          const oldKey = `@Log_${prev.programId}_${prev.sessionId}_${date}`;
          await AsyncStorage.removeItem(oldKey);
      }

      const newKey = `@Log_${programId}_${sessionId}_${date}`;
      const data = {
        blocks,
        lastModified: Date.now()
      };

      if (blocks.length > 0) {
          await AsyncStorage.setItem(newKey, JSON.stringify(data));
          setSessionForDate(date, programId, sessionId);
      } else {
          await AsyncStorage.removeItem(newKey);
          // If empty, keep assignment if manually selected?
          // Usually better to keep assignment so user sees "Empty Log" instead of nothing.
          // But if truly empty, maybe remove from map?
          // Let's keep map assignment for explicit user choice.
          setSessionForDate(date, programId, sessionId);
      }
    } catch (e) {
      console.error("Failed to save log", e);
    }
  };

  // --- Program Management ---

  const addProgram = (name) => {
    const id = 'prog_' + Date.now();
    const newProg = {
        id,
        name,
        sessions: [
             { id: 'sess_' + Date.now() + '_1', name: 'Push' },
             { id: 'sess_' + Date.now() + '_2', name: 'Pull' },
             { id: 'sess_' + Date.now() + '_3', name: 'Legs' }
        ]
    };
    setPrograms([...programs, newProg]);
    setCurrentProgram(id);
  };

  const updateProgram = (id, newName) => {
      setPrograms(programs.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const deleteProgram = async (id) => {
      if (programs.length <= 1) return;

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

  // --- Session Management ---

  const addSession = (programId, name) => {
      const sessId = 'sess_' + Date.now();
      setPrograms(programs.map(p => {
          if (p.id === programId) {
              return { ...p, sessions: [...p.sessions, { id: sessId, name }] };
          }
          return p;
      }));
  };

  const updateSession = (programId, sessionId, newName) => {
      setPrograms(programs.map(p => {
          if (p.id === programId) {
              return {
                  ...p,
                  sessions: p.sessions.map(s => s.id === sessionId ? { ...s, name: newName } : s)
              };
          }
          return p;
      }));
  };

  const deleteSession = async (programId, sessionId) => {
      try {
          setPrograms(programs.map(p => {
              if (p.id === programId) {
                  return { ...p, sessions: p.sessions.filter(s => s.id !== sessionId) };
              }
              return p;
          }));

          // Remove from map
          setSessionMap(prev => {
              const next = { ...prev };
              Object.keys(next).forEach(date => {
                  if (next[date]?.sessionId === sessionId && next[date]?.programId === programId) {
                      delete next[date];
                  }
              });
              return next;
          });

          // Remove logs: @Log_${programId}_${sessionId}_${date}
          const keys = await AsyncStorage.getAllKeys();
          const prefix = `@Log_${programId}_${sessionId}_`;
          const toRemove = keys.filter(k => k.startsWith(prefix));

          if (toRemove.length > 0) {
              await AsyncStorage.multiRemove(toRemove);
          }
      } catch (e) {
          console.error("Failed to delete session logs", e);
      }
  };

  const resetAllData = async () => {
      try {
          await AsyncStorage.clear();
          try {
              await Updates.reloadAsync();
          } catch (e) {
              // Reload manually if needed or just let state reset on next mount
              console.log("Reload not available");
              // Force reload state manually to default
              const defaultProgId = 'prog_' + Date.now();
              const defaultSessions = [
                   { id: 'sess_' + Date.now() + '_1', name: 'Push' },
                   { id: 'sess_' + Date.now() + '_2', name: 'Pull' },
                   { id: 'sess_' + Date.now() + '_3', name: 'Legs' }
              ];
              setPrograms([{ id: defaultProgId, name: 'Program 1', sessions: defaultSessions }]);
              setCurrentProgram(defaultProgId);
              setSessionMap({});
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
