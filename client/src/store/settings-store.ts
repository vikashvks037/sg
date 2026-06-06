import { create } from "zustand";
import { Settings } from "@/types";

interface SettingsState {
  settings: Settings;
  setSettings: (settings: Settings) => void;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: {},
  setSettings: (settings) => set({ settings }),
}));
