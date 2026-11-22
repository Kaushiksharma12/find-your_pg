"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Check, X, Star, MapPin } from "lucide-react";
import { MarketplaceShell } from "@/components/shells/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PROPERTIES_DATA } from "@/lib/mock-data";

export default function ComparePage() {
  const comparedProperties = PROPERTIES_DATA.slice(0, 3);

  return (
    <MarketplaceShell>
      <div className="space-y-8 pb-16">
        
        {/* Navigation & Header */}
        <div className="space-y-2 pt-2">
          <Link href="/browse" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Search Results
          </Link>
          <h1 className="font-display font-extrabold text-3xl text-[var(--text-primary)]">
            Side-by-Side Property Comparison
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Compare monthly rent, amenities, safety features, and distance to college across your shortlisted stays.
          </p>
        </div>

        {/* Comparison Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-[var(--surface-border)]">
                <th className="p-4 text-left font-bold text-xs text-[var(--text-muted)] uppercase w-1/4">
                  Feature / Property
                </th>
                {comparedProperties.map((p) => (
                  <th key={p.id} className="p-4 text-left w-1/4">
                    <Card className="p-4 rounded-2xl border-[var(--surface-border)] bg-[var(--surface)] space-y-2 font-normal">
                      <img src={p.images[0]} alt={p.title} className="w-full h-32 object-cover rounded-xl" />
                      <div className="font-bold text-sm text-[var(--text-primary)] line-clamp-1">{p.title}</div>
                      <div className="text-xs font-extrabold text-[#FF5A36]">₹{p.startingPrice.toLocaleString()} /mo</div>
                      <Link href={`/properties/${p.id}`}>
                        <Button variant="primary" size="sm" className="w-full bg-[#FF5A36] text-xs rounded-xl mt-1">
                          View Details
                        </Button>
                      </Link>
                    </Card>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--surface-border)] text-xs text-[var(--text-primary)]">
              
              {/* Category */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Property Type</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold">{p.type}</td>
                ))}
              </tr>

              {/* Location */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Locality</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4">{p.locality}, {p.city}</td>
                ))}
              </tr>

              {/* Rating */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Rating & Reviews</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 font-bold text-amber-500">
                    ★ {p.rating} ({p.reviewCount})
                  </td>
                ))}
              </tr>

              {/* Distance from college */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Distance to College</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-[var(--text-secondary)]">{p.distanceFromCollege}</td>
                ))}
              </tr>

              {/* Food Provided */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Meals Included</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    {p.foodProvided ? (
                      <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Included</span>
                    ) : (
                      <span className="text-[var(--text-muted)] flex items-center gap-1"><X className="h-4 w-4" /> Self Cooking</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Wi-Fi 6 */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Wi-Fi High Speed</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4">
                    <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="h-4 w-4" /> Yes</span>
                  </td>
                ))}
              </tr>

              {/* Curfew */}
              <tr>
                <td className="p-4 font-bold text-[var(--text-muted)] uppercase">Curfew Timing</td>
                {comparedProperties.map((p) => (
                  <td key={p.id} className="p-4">{p.houseRules[0] || "No Curfew"}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </MarketplaceShell>
  );
}
