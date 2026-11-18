import { create } from "zustand";
import type { UserInterface } from "@/lib/interface";

interface AuthState {
  isLoggedIn: boolean;
  user: UserInterface | null;
  login: (user: UserInterface, token: string) => void;
  updateUser: (user: UserInterface) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  let parsedUser = null;
  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
      // Check if parsedUser is actually an object
      if (typeof parsedUser !== "object" || parsedUser === null) {
        parsedUser = null;
      }
    } catch (e) {
      console.warn("Failed to parse user from localStorage:", e);
      parsedUser = null;
    }
  }

  return {
    isLoggedIn: !!storedToken && !!parsedUser,
    user: parsedUser,
    login: (user, token) => {
      if (user && token) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        set({ isLoggedIn: true, user });
      }
    },
    updateUser: (user) => {
      localStorage.setItem("user", JSON.stringify(user));
      set({ isLoggedIn: true, user });
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ isLoggedIn: false, user: null });
    },
  };
});