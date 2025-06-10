import { createContext } from "react";
import { AppStateContextType } from "@/contexts/AppStateTypes";

// Create context with undefined as initial value
export const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);
