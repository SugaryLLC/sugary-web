/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useLocationStore } from "@/stores/uselocationStore";
import { useEffect, useRef, useState } from "react";
import Script from "next/script";

type Prediction = { description: string; place_id: string };

// Add to .env.local: NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";

const PlaceSearch = ({
  placeholder = "Search places…",
  region = "bd",
  language = "en",
}: {
  placeholder?: string;
  region?: string;
  language?: string;
}) => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const setSearchTarget = useLocationStore((s) => s.setSearchTarget);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const serviceRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const placesRef = useRef<google.maps.places.PlacesService | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (scriptLoaded && window.google) {
      serviceRef.current = new google.maps.places.AutocompleteService();
      const div = document.createElement("div");
      placesRef.current = new google.maps.places.PlacesService(div);
      sessionTokenRef.current =
        new google.maps.places.AutocompleteSessionToken();
    }
  }, [scriptLoaded]);

  const [debounced, setDebounced] = useState(input);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(input), 300);
    return () => clearTimeout(id);
  }, [input]);

  useEffect(() => {
    const q = debounced.trim();
    if (!q || !serviceRef.current) {
      setResults([]);
      setOpen(false);
      return;
    }

    serviceRef.current.getPlacePredictions(
      {
        input: q,
        componentRestrictions: { country: region },
        language,
        sessionToken: sessionTokenRef.current!,
      },
      (predictions: any, status: any) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          const items = predictions.map((p: any) => ({
            description: p.description,
            place_id: p.place_id,
          }));
          setResults(items);
          setOpen(true);
          setError(null);
        } else if (
          status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS
        ) {
          setResults([]);
          setOpen(false);
          setError(null);
        } else {
          setResults([]);
          setOpen(false);
          setError("Search failed");
        }
      }
    );
  }, [debounced, region, language]);

  const pick = (p: Prediction) => {
    setInput(p.description);
    setOpen(false);

    if (!placesRef.current) return;

    placesRef.current.getDetails(
      {
        placeId: p.place_id,
        fields: ["geometry"],
        sessionToken: sessionTokenRef.current!,
      },
      (place: any, status: any) => {
        if (
          status === google.maps.places.PlacesServiceStatus.OK &&
          place?.geometry?.location
        ) {
          const loc = place.geometry.location;
          setSearchTarget({ lat: loc.lat(), lng: loc.lng(), zoom: 15 });
          sessionTokenRef.current =
            new google.maps.places.AutocompleteSessionToken();
        }
      }
    );
  };

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&language=${language}`}
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      <div ref={wrapRef} className="relative w-full max-w-xl z-[60]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full border bg-card px-4 py-2 text-sm"
          onFocus={() => results.length && setOpen(true)}
          disabled={!scriptLoaded}
        />

        {open && results.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-auto rounded-xl border bg-background shadow-xl z-[70]">
            {results.map((r) => (
              <button
                key={r.place_id}
                className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => pick(r)}
              >
                {r.description}
              </button>
            ))}
          </div>
        )}

        {error && <div className="mt-1 text-xs text-red-500">⚠️ {error}</div>}
      </div>
    </>
  );
};

export default PlaceSearch;
