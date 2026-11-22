"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, Plus, MapPin, Eye, Edit, BedDouble } from "lucide-react";
import { OwnerShell } from "@/components/shells/owner-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_OWNER_DATA, PROPERTIES_DATA } from "@/lib/mock-data";

export default function OwnerPropertiesPage() {
  return (
    <OwnerShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">My Properties</h1>
            <p className="text-xs text-[var(--text-secondary)]">Manage your published PG listings and inventory</p>
          </div>
          <Link href="/owner/properties/new">
            <Button variant="primary" size="sm" className="bg-[#FF5A36] text-white rounded-xl text-xs gap-1.5 font-bold">
              <Plus className="h-4 w-4" /> Add Property
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_OWNER_DATA.properties.map((prop) => (
            <Card key={prop.id} className="rounded-3xl overflow-hidden border-[var(--surface-border)] bg-[var(--surface)] shadow-sm space-y-3">
              <div className="relative h-44 w-full">
                <img
                  src={PROPERTIES_DATA.find((p) => p.id === prop.id)?.images[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"}
                  alt={prop.title}
                  className="w-full h-full object-cover"
                />
                <Badge variant="emerald" size="sm" className="absolute top-3 left-3">{prop.status}</Badge>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-bold text-base text-[var(--text-primary)]">{prop.title}</h3>
                  <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" /> {prop.city}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--surface-border)]">
                  <span>Active Rooms: <strong>{prop.totalRooms}</strong></span>
                  <span>Occupancy: <strong className="text-emerald-500">{Math.round((prop.occupiedRooms / prop.totalRooms) * 100)}%</strong></span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/properties/${prop.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1">
                      <Eye className="h-3.5 w-3.5" /> View Public Page
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </OwnerShell>
  );
}
