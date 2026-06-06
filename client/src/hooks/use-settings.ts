"use client";
import { useCallback } from "react";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";
import { useSettingsStore } from "@/store/settings-store";

export function useSettings() {
  const { settings, setSettings } = useSettingsStore();

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await api.get(API.common.settings);
      if (data.success) setSettings(data.data);
    } catch { /* silent */ }
  }, [setSettings]);

  return { settings, fetchSettings, setSettings };
}
