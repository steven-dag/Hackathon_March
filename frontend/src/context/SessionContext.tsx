import { createContext, useContext, useState, ReactNode } from "react";
import { GrantMatch, Plan } from "../services/api";

interface SessionContextType {
  sessionId: string | null;
  setSessionId: (id: string) => void;
  grants: GrantMatch[];
  setGrants: (grants: GrantMatch[]) => void;
  plan: Plan | null;
  setPlan: (plan: Plan) => void;
  companyName: string;
  setCompanyName: (name: string) => void;
}

const SessionContext = createContext<SessionContextType>({
  sessionId: null,
  setSessionId: () => {},
  grants: [],
  setGrants: () => {},
  plan: null,
  setPlan: () => {},
  companyName: "",
  setCompanyName: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [grants, setGrants] = useState<GrantMatch[]>([]);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [companyName, setCompanyName] = useState<string>("");

  return (
    <SessionContext.Provider
      value={{ sessionId, setSessionId, grants, setGrants, plan, setPlan, companyName, setCompanyName }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
