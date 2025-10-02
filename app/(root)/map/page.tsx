// app/(root)/map/page.tsx
"use client";

import PlaceSearch from "@/components/PlaceSearch";
import { useLocationStore } from "@/stores/uselocationStore";
import dynamic from "next/dynamic";

const MapboxPicker = dynamic(() => import("@/components/MapboxPicker"), {
  ssr: false,
});

export default function MapPage() {
  const { lat, lng, zoom } = useLocationStore((s) => s.location);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Find a place</h1>

      {/* Search sits in its own block with high z-index */}
      <PlaceSearch region="bd" language="en" />

      {/* Map below (don’t wrap both in the same overflow-hidden box) */}
      <MapboxPicker heightClassName="h-[480px]" />

      {/* (optional) live values */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded-xl border bg-card p-3">
          <div className="text-muted-foreground">Latitude</div>
          <div className="font-medium">{lat.toFixed(6)}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-muted-foreground">Longitude</div>
          <div className="font-medium">{lng.toFixed(6)}</div>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <div className="text-muted-foreground">Zoom</div>
          <div className="font-medium">{zoom.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
}
