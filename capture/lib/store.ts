import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Scene } from "./types";

interface AppState {
  apiBaseUrl: string;
  scenes: Scene[];
  setApiBaseUrl: (u: string) => void;
  addScene: (s: Scene) => void;
  updateScene: (id: string, patch: Partial<Scene>) => void;
  removeScene: (id: string) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      apiBaseUrl: "http://10.0.2.2:8000",
      scenes: [],
      setApiBaseUrl: (u) => set({ apiBaseUrl: u }),
      addScene: (s) => set((st) => ({ scenes: [s, ...st.scenes] })),
      updateScene: (id, patch) =>
        set((st) => ({
          scenes: st.scenes.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        })),
      removeScene: (id) => set((st) => ({ scenes: st.scenes.filter((x) => x.id !== id) })),
    }),
    { name: "splat-capture", storage: createJSONStorage(() => AsyncStorage) },
  ),
);
