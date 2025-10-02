"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type LocationState = { lat: number; lng: number; zoom: number };
type LocationContextType = {
  location: LocationState;
  setLocation: (next: LocationState) => void;
  resetLocation: () => void;
};

const DEFAULT_LOCATION: LocationState = {
  lat: 23.8103,
  lng: 90.4125,
  zoom: 12,
};
const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<LocationState>(DEFAULT_LOCATION);
  const hasUserSetRef = useRef(false);

  // When setLocation is called (e.g., by MapboxPicker), remember we have a user value
  const guardedSetLocation = (next: LocationState) => {
    hasUserSetRef.current = true;
    setLocation(next);
  };

  // Hydrate once from localStorage (only if the user hasn't moved the map yet)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("app.location");
      if (raw && !hasUserSetRef.current) {
        const parsed = JSON.parse(raw);
        if (
          typeof parsed?.lat === "number" &&
          typeof parsed?.lng === "number"
        ) {
          setLocation({
            lat: parsed.lat,
            lng: parsed.lng,
            zoom:
              typeof parsed.zoom === "number"
                ? parsed.zoom
                : DEFAULT_LOCATION.zoom,
          });
        }
      }
    } catch {}
  }, []);

  // Persist whenever location changes
  useEffect(() => {
    try {
      localStorage.setItem("app.location", JSON.stringify(location));
    } catch {}
  }, [location]);

  const value = useMemo(
    () => ({
      location,
      setLocation: guardedSetLocation,
      resetLocation: () => setLocation(DEFAULT_LOCATION),
    }),
    [location]
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx)
    throw new Error("useLocation must be used inside <LocationProvider />");
  return ctx;
}
