import { createContext, useContext, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [issues, setIssues] = useState([]);

  const setAuthErrorAndClear = (err) => setAuthError(err);
  const clearAuthError = () => setAuthError(null);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authLoading,
        setAuthLoading,
        authError,
        setAuthError: setAuthErrorAndClear,
        clearAuthError,
        issues,
        setIssues,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) {
    return {
      user: null,
      setUser: () => {},
      authLoading: true,
      setAuthLoading: () => {},
      authError: null,
      setAuthError: () => {},
      clearAuthError: () => {},
      issues: [],
      setIssues: () => {},
    };
  }
  return context;
}
