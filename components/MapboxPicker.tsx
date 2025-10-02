/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl, { Map, Marker, GeolocateControl } from "mapbox-gl";

import "mapbox-gl/dist/mapbox-gl.css";
import { useLocationStore } from "@/stores/uselocationStore";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type Pos = { lat: number; lng: number; zoom: number };

type MapboxPickerProps = {
  heightClassName?: string;
  className?: string;
  styleUrl?: string;
};

export default function MapboxPicker({
  heightClassName = "h-[420px]",
  className = "",
  styleUrl = "mapbox://styles/mapbox/streets-v12",
}: MapboxPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const geolocateRef = useRef<GeolocateControl | null>(null);

  const [geoError, setGeoError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fallbackTimerRef = useRef<number | null>(null);

  // Zustand store
  const setLocation = useLocationStore((s) => s.setLocation);
  // initial center from persisted store
  const initialRef = useRef<Pos>(useLocationStore.getState().location);

  // keep latest setter for handlers
  const setLocationRef = useRef(setLocation);
  useEffect(() => {
    setLocationRef.current = setLocation;
  }, [setLocation]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!mapboxgl.accessToken) {
      console.warn(
        "Mapbox token missing. Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local"
      );
      return;
    }

    const { lat, lng, zoom } = initialRef.current;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: styleUrl,
      center: [lng, lat], // [lng, lat]
      zoom,
      attributionControl: false,
      cooperativeGestures: true,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
      trackUserLocation: true,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 16 },
      showAccuracyCircle: false,
    });
    geolocateRef.current = geolocate;
    map.addControl(geolocate, "top-right");

    // ✅ SAME Mapbox marker icon (default), keep it at visual center
    const marker = new mapboxgl.Marker({ draggable: false })
      .setLngLat([lng, lat])
      .addTo(map);
    markerRef.current = marker;

    // Keep marker visually at the map's center while moving
    map.on("move", () => {
      const c = map.getCenter();
      marker.setLngLat(c);
    });

    // Only update global state AFTER interaction ends
    const emitCenterOnce = () => {
      const c = map.getCenter();
      setLocationRef.current({
        lat: c.lat,
        lng: c.lng,
        zoom: map.getZoom(),
      });
    };

    map.on("dragstart", () => setIsDragging(true));
    map.on("dragend", () => {
      setIsDragging(false);
      emitCenterOnce();
    });
    map.on("zoomend", emitCenterOnce);
    map.on("moveend", emitCenterOnce);
    map.on("load", emitCenterOnce);

    // Geolocate: fly to user; store updates on moveend
    geolocate.on("geolocate", (pos: GeolocationPosition) => {
      setLocating(false);
      setGeoError(null);
      if (fallbackTimerRef.current !== null) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      const { latitude, longitude } = pos.coords;
      map.flyTo({
        center: [longitude, latitude],
        zoom: Math.max(map.getZoom(), 15),
      });
    });

    geolocate.on("error", (e: any) => {
      setLocating(false);
      if (fallbackTimerRef.current !== null) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      setGeoError(humanizeGeoError(e));
      console.warn("Geolocate error:", e);
    });

    return () => {
      if (fallbackTimerRef.current !== null) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
      geolocateRef.current = null;
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [styleUrl]);

  // Manual browser geolocate fallback
  const manualBrowserLocate = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not supported by this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });
    });

  const goToMyLocation = async () => {
    if (!mapRef.current) return;
    setGeoError(null);
    setLocating(true);

    try {
      geolocateRef.current?.trigger();
    } catch {
      // ignore; fallback below
    }

    // Fallback if control doesn't respond quickly
    fallbackTimerRef.current = window.setTimeout(async () => {
      try {
        const pos = await manualBrowserLocate();
        const { latitude, longitude } = pos.coords;
        mapRef.current!.flyTo({
          center: [longitude, latitude],
          zoom: Math.max(mapRef.current!.getZoom(), 15),
        });
        setLocating(false);
        // store updates on moveend
      } catch (err: any) {
        setLocating(false);
        setGeoError(err?.message || "Could not get your location (fallback).");
      } finally {
        if (fallbackTimerRef.current !== null) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      }
    }, 1200);
  };
  const searchTarget = useLocationStore((s) => s.searchTarget);
  const setSearchTarget = useLocationStore((s) => s.setSearchTarget);

  useEffect(() => {
    // When user selects a place from PlacesSearch, fly there
    if (!searchTarget || !mapRef.current) return;
    const { lat, lng, zoom } = searchTarget;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: zoom ?? Math.max(mapRef.current.getZoom(), 15),
    });
    // clear so we don't refly on every render
    setSearchTarget(null);
  }, [searchTarget, setSearchTarget]);
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl border bg-card ${className}`}
    >
      <div ref={containerRef} className={`w-full ${heightClassName}`} />

      {/* Drag hint */}
      <div className="pointer-events-none absolute left-2 bottom-2 rounded-full bg-black/60 px-3 py-1 text-xs text-white shadow">
        Drag the map — we’ll update after you release
      </div>

      {/* Geolocate button */}
      <button
        type="button"
        onClick={goToMyLocation}
        className="absolute left-2 top-2 z-10 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
      >
        {locating ? "Locating…" : "Use my location"}
      </button>

      {/* Error bubble */}
      {geoError && (
        <div className="absolute right-2 top-2 z-10 max-w-[260px] rounded-lg bg-red-600/90 p-2 text-xs text-white shadow">
          {geoError}
        </div>
      )}
    </div>
  );
}

function humanizeGeoError(err: any): string {
  if (typeof window !== "undefined" && !("geolocation" in navigator)) {
    return "Geolocation not supported by this browser.";
  }
  const insecure =
    typeof window !== "undefined" &&
    window.isSecureContext === false &&
    location.hostname !== "localhost";
  if (insecure) return "Geolocation requires HTTPS (or http://localhost).";
  const native = err?.error || err;
  switch (native?.code) {
    case 1:
      return "Permission to access location was denied.";
    case 2:
      return "Position unavailable. Try again.";
    case 3:
      return "Location request timed out.";
    default:
      return native?.message || "Could not get your location.";
  }
}
