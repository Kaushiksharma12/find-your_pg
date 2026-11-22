"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, MapPin, Star, ArrowRight, Trash2 } from "lucide-react";
import { UserShell } from "@/components/shells/user-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PROPERTIES_DATA } from "@/lib/mock-data";

export default function ShortlistedPropertiesPage() {
  const [savedProperties, setSavedProperties] = React.useState(PROPERTIES_DATA);

  const removeProperty = (id: string) => {
    setSavedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <UserShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">Shortlisted PGs & Stays</h1>
            <p className="text-xs text-[var(--text-secondary)]">Your saved accommodation shortlist</p>
          </div>
          <Link href="/compare">
            <Button variant="outline" size="sm" className="rounded-xl border-[var(--surface-border)] text-xs font-semibold">
              Compare Shortlist Side-by-Side
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <Card key={property.id} className="rounded-3xl overflow-hidden border-[var(--surface-border)] bg-[var(--surface)] shadow-sm space-y-3">
              <div className="relative h-44 w-full">
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeProperty(property.id)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 dark:bg-black/60 flex items-center justify-center text-rose-500 hover:scale-110 transition-transform"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <CardContent className="p-4 space-y-2">
                <div className="font-bold text-base text-[var(--text-primary)]">{property.title}</div>
                <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" /> {property.locality}, {property.city}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-border)]">
                  <div className="font-extrabold text-[#FF5A36]">₹{property.startingPrice.toLocaleString()}/mo</div>
                  <Link href={`/properties/${property.id}`}>
                    <Button variant="primary" size="sm" className="bg-[#FF5A36] text-xs rounded-xl">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UserShell>
  );
}
