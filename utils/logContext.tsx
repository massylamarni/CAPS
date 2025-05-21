import React, { createContext, useContext, useState } from 'react';

type LogContextType = {
  logs: string[];
  addLog: (tag:string, message: string) => void;
};

const LogContext = createContext<LogContextType | undefined>(undefined);

export const useLogs = (): LogContextType => {
  const context = useContext(LogContext);
  if (!context) {
    throw new Error('useLogs must be used within a LogProvider');
  }
  return context;
};

export const LogProvider = ({ children }: { children: React.ReactNode }) => {
  const [logs, setLogs] = useState([] as string[]);
  console.log(logs[logs.length-1]);

  const addLog = (tag: string, message: string) => {
    setLogs(prev => [...prev, `[${tag}] ${message}`]);
  };

  return (
    <LogContext.Provider value={{ logs, addLog }}>
      {children}
    </LogContext.Provider>
  );
};
