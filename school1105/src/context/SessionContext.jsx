import { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [session_id, setSessionId] = useState(
    localStorage.getItem("session_id") || ""
  );

  return (
    <SessionContext.Provider value={{ session_id, setSessionId }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);