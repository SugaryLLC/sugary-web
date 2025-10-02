"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type LocationState = { lat: number; lng: number; zoom: number };
export type TargetState = { lat: number; lng: number; zoom?: number } | null;

type Store = {
  location: LocationState;
  setLocation: (next: LocationState) => void;
  reset: () => void;

  // 🔎 search selection target → MapboxPicker will flyTo this and then clear
  searchTarget: TargetState;
  setSearchTarget: (t: TargetState) => void;

  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
};

const DEFAULT: LocationState = { lat: 23.8103, lng: 90.4125, zoom: 12 };

export const useLocationStore = create<Store>()(
  persist(
    (set) => ({
      location: DEFAULT,
      setLocation: (next) => set({ location: next }),
      reset: () => set({ location: DEFAULT }),

      searchTarget: null,
      setSearchTarget: (t) => set({ searchTarget: t }),

      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: "app.location",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useLocationHydrated() {
  return useLocationStore((s) => s._hasHydrated);
}
