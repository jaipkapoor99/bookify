import { useContext } from "react";
import { AppStateContext } from "@/contexts/AppStateContext";

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
