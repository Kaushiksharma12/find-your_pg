"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Search, Star, Heart, ArrowLeft, Layers, SlidersHorizontal } from "lucide-react";
import { MarketplaceShell } from "@/components/shells/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROPERTIES_DATA, Property } from "@/lib/mock-data";

export default function MapDiscoveryPage() {
  const [selectedProperty, setSelectedProperty] = React.useState<Property | null>(PROPERTIES_DATA[0]);

  return (
    <MarketplaceShell>
      <div className="h-[calc(100vh-5rem)] flex flex-col space-y-4 pt-2 pb-4">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/browse" className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to Grid View
            </Link>
            <h1 className="font-display font-black text-xl text-[var(--text-primary)] hidden sm:block">
              Map Discovery
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="amber" size="sm" className="gap-1">
              <MapPin className="h-3.5 w-3.5" /> {PROPERTIES_DATA.length} PGs Pinpointed
            </Badge>
          </div>
        </div>

        {/* Fullscreen Map & Property Split Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-xl">
          
          {/* Left Column: Scrollable Property List (5 cols) */}
          <div className="lg:col-span-5 p-4 overflow-y-auto space-y-4 divide-y divide-[var(--surface-border)]">
            <div className="font-bold text-sm text-[var(--text-primary)] pb-2">
              Showing stays in Bangalore & Pune
            </div>

            {PROPERTIES_DATA.map((prop) => {
              const isSelected = selectedProperty?.id === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`pt-4 cursor-pointer transition-all ${
                    isSelected ? "opacity-100" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <Card
                    className={`p-3 rounded-2xl border-2 transition-all flex gap-3 ${
                      isSelected
                        ? "border-[#FF5A36] bg-[#FFF1EE]/40 dark:bg-[#FF5A36]/10"
                        : "border-[var(--surface-border)] bg-[var(--surface-hover)]"
                    }`}
                  >
                    <img src={prop.images[0]} alt={prop.title} className="w-24 h-24 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="font-bold text-xs text-[var(--text-primary)] truncate">{prop.title}</div>
                      <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#FF5A36]" /> {prop.locality}, {prop.city}
                      </div>
                      <div className="font-extrabold text-[#FF5A36] text-xs">
                        ₹{prop.startingPrice.toLocaleString()} /mo
                      </div>
                      <div className="flex items-center gap-2 pt-1 text-[10px]">
                        <Badge variant="glass" size="sm">{prop.type}</Badge>
                        <span className="text-amber-500 font-bold">★ {prop.rating}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Right Column: Simulated Interactive Vector Map View (7 cols) */}
          <div className="lg:col-span-7 relative bg-[#1C1B19] overflow-hidden flex items-center justify-center">
            
            {/* Styled Map Background Canvas Simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(#302E2B_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

            {/* Map Roads & Contours Graphics */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 100 Q 200 300 400 150 T 800 500" stroke="#FF5A36" strokeWidth="4" fill="none" />
              <path d="M 100 0 Q 300 400 600 200 T 900 800" stroke="#45413C" strokeWidth="3" fill="none" />
            </svg>

            {/* Simulated Interactive Map Pins */}
            {PROPERTIES_DATA.map((prop, idx) => {
              const positions = [
                { top: "30%", left: "40%" },
                { top: "50%", left: "65%" },
                { top: "65%", left: "25%" },
                { top: "25%", left: "75%" },
              ];
              const pos = positions[idx % positions.length];
              const isSelected = selectedProperty?.id === prop.id;

              return (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10 ${
                    isSelected ? "scale-125 z-30" : "hover:scale-110"
                  }`}
                >
                  <div
                    className={`px-2.5 py-1 rounded-full font-bold text-[11px] shadow-lg flex items-center gap-1 transition-all ${
                      isSelected
                        ? "bg-[#FF5A36] text-white ring-4 ring-[#FF5A36]/40"
                        : "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--surface-border)]"
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    <span>₹{(prop.startingPrice / 1000).toFixed(1)}k</span>
                  </div>
                </button>
              );
            })}

            {/* Selected Property Map Popup Card */}
            {selectedProperty && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-80 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--surface-border)] shadow-2xl space-y-2">
                <div className="relative h-28 w-full rounded-xl overflow-hidden">
                  <img src={selectedProperty.images[0]} alt={selectedProperty.title} className="w-full h-full object-cover" />
                  <Badge variant="amber" size="sm" className="absolute top-2 left-2">
                    ★ {selectedProperty.rating}
                  </Badge>
                </div>
                <div>
                  <div className="font-bold text-xs text-[var(--text-primary)] truncate">{selectedProperty.title}</div>
                  <div className="text-[10px] text-[var(--text-secondary)]">{selectedProperty.locality}, {selectedProperty.city}</div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="font-extrabold text-[#FF5A36] text-xs">
                    ₹{selectedProperty.startingPrice.toLocaleString()} /mo
                  </div>
                  <Link href={`/properties/${selectedProperty.id}`}>
                    <Button variant="primary" size="sm" className="bg-[#FF5A36] text-[10px] h-7 px-3 rounded-lg">
                      View Stay Details
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MarketplaceShell>
  );
}
