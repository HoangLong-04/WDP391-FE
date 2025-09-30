import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

// custom hook
export function useAuth() {
  return useContext(AuthContext);
}
