"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Filter,
  Heart,
  Star,
  ArrowRight,
  ChevronDown,
  Check,
  BedDouble,
  Building2,
  Utensils,
  Wifi,
  Sparkles,
} from "lucide-react";

import { MarketplaceShell } from "@/components/shells/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getOrCreateSessionId } from "@/lib/utils";
import { CITIES_DATA, PROPERTIES_DATA, Property } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { SearchIntent } from "@/lib/validators/ai";

function BrowseContent() {
  const searchParams = useSearchParams();
  const { requireAuth } = useAuth();
  const initialCity = searchParams.get("city") || "all";
  const initialQuery = searchParams.get("q") || "";

  // Filter States
  const [selectedCity, setSelectedCity] = React.useState(initialCity);
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [preferredFor, setPreferredFor] = React.useState<string[]>(["Anyone"]);
  const [maxPrice, setMaxPrice] = React.useState<number>(20000);
  const [roomTypes, setRoomTypes] = React.useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = React.useState<string[]>([]);
  const [sortBy, setSortBy] = React.useState<"relevance" | "price-low" | "price-high" | "rating">("relevance");
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

  // AI Intent & Candidate State
  const [parsedIntent, setParsedIntent] = React.useState<SearchIntent | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiCandidates, setAICandidates] = React.useState<Record<string, any>[] | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [aiMeta, setAIMeta] = React.useState<Record<string, any> | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [activeSearchId, setActiveSearchId] = React.useState<string | null>(null);

  const handleAISearch = async (queryToParse?: string) => {
    const q = (queryToParse !== undefined ? queryToParse : searchQuery).trim();
    if (!q) {
      setActiveSearchId(null);
      return;
    }

    const sessionId = getOrCreateSessionId();

    setIsParsing(true);
    try {
      const res = await fetch("/api/v1/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, sessionId }),
      });
      const data = await res.json();
      if (data.success && data.intent) {
        const intent: SearchIntent = data.intent;
        setParsedIntent(intent);
        setAICandidates(data.results || []);
        setAIMeta(data.meta || null);
        setActiveSearchId(data.searchId || null);

        // Synchronize UI filter state with parsed intent
        if (intent.maxPrice) setMaxPrice(intent.maxPrice);
        if (intent.preferredFor) setPreferredFor([intent.preferredFor]);
        if (intent.city) setSelectedCity(intent.city.toLowerCase());
        if (intent.amenities && intent.amenities.length > 0) {
          setSelectedAmenities(intent.amenities);
        }
      } else {
        setActiveSearchId(null);
      }
    } catch (err) {
      console.error("Failed to execute AI candidate search:", err);
      setActiveSearchId(null);
    } finally {
      setIsParsing(false);
    }
  };

  const toggleFavorite = (e: React.MouseEvent, propId: string) => {
    e.stopPropagation();
    e.preventDefault();
    requireAuth(
      () => {
        const isFav = !favorites[propId];
        setFavorites((prev) => ({ ...prev, [propId]: isFav }));
        const sessionId = getOrCreateSessionId();
        fetch("/api/v1/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: isFav ? "PROPERTY_SAVED" : "PROPERTY_UNSAVED",
            propertyId: propId,
            sessionId,
            ...(activeSearchId ? { searchId: activeSearchId } : {}),
          }),
        }).catch(() => {});
      },
      {
        reason: "Sign in to save this property to your shortlist.",
      }
    );
  };


  const togglePreferredFor = (val: string) => {
    if (val === "Anyone") {
      setPreferredFor(["Anyone"]);
    } else {
      let updated = preferredFor.filter((item) => item !== "Anyone");
      if (updated.includes(val)) {
        updated = updated.filter((item) => item !== val);
      } else {
        updated.push(val);
      }
      setPreferredFor(updated.length === 0 ? ["Anyone"] : updated);
    }
  };

  const toggleRoomType = (type: string) => {
    setRoomTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((item) => item !== amenity) : [...prev, amenity]
    );
  };

  const clearAllFilters = () => {
    setSelectedCity("all");
    setSearchQuery("");
    setPreferredFor(["Anyone"]);
    setMaxPrice(20000);
    setRoomTypes([]);
    setSelectedAmenities([]);
    setSortBy("relevance");
    setParsedIntent(null);
    setAICandidates(null);
    setAIMeta(null);
    setActiveSearchId(null);
  };

  // Filtered Properties Computation
  const filteredProperties = React.useMemo(() => {
    const result = PROPERTIES_DATA.filter((item) => {
      // City Filter
      if (selectedCity !== "all" && item.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      // Query Filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesLocality = item.locality.toLowerCase().includes(q);
        const matchesCity = item.city.toLowerCase().includes(q);
        if (!matchesTitle && !matchesLocality && !matchesCity) return false;
      }
      // Price Filter
      if (item.startingPrice > maxPrice) return false;
      // Preferred For Filter
      if (!preferredFor.includes("Anyone")) {
        if (preferredFor.includes("Male") && item.preferredFor === "Female") return false;
        if (preferredFor.includes("Female") && item.preferredFor === "Male") return false;
      }
      // Amenities Filter
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((a) => item.amenities.includes(a));
        if (!hasAllAmenities) return false;
      }
      // Room Types Filter
      if (roomTypes.length > 0) {
        const hasMatchingRoom = item.rooms?.some((r) => roomTypes.includes(r.occupancy));
        if (!hasMatchingRoom) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCity, searchQuery, maxPrice, preferredFor, selectedAmenities, roomTypes, sortBy]);

  return (
    <MarketplaceShell>
      <div className="space-y-6 pb-12">
        {/* AI/ML Natural Language Search Container */}
        <Card className="p-5 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-[var(--surface)] to-amber-500/10 space-y-4 shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="font-display font-extrabold text-sm text-[var(--text-primary)]">
                AI Natural Language Accommodation Search
              </h2>
            </div>
            <Badge variant="emerald" size="sm" className="bg-purple-100 dark:bg-purple-950/50 text-purple-600 border-purple-300">
              ⚡ AI Model Ready
            </Badge>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAISearch();
              }}
              placeholder="e.g. Find me a furnished PG near Christ University under ₹12,000 with meals and Wi-Fi..."
              className="w-full bg-[var(--surface)] border-2 border-purple-500/40 rounded-2xl pl-4 pr-28 py-3 text-xs text-[var(--text-primary)] font-medium focus:outline-none focus:border-purple-600 shadow-sm"
            />
            <Button
              onClick={() => handleAISearch()}
              disabled={isParsing}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold gap-1 h-8 px-3"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isParsing ? "Analyzing..." : "AI Search"}</span>
            </Button>
          </div>

          {/* Parsed Search Intent Display State */}
          {parsedIntent && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Interpreted Search Intent</span>
                </div>
                <button
                  onClick={() => {
                    setParsedIntent(null);
                    setAICandidates(null);
                    setAIMeta(null);
                  }}
                  className="text-[10px] font-semibold text-purple-600 hover:underline"
                >
                  Clear Intent
                </button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {parsedIntent.landmarkOrCollege && (
                  <Badge variant="amber" size="sm" className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                    📍 Location: {parsedIntent.landmarkOrCollege}
                  </Badge>
                )}
                {parsedIntent.locality && (
                  <Badge variant="amber" size="sm">
                    🏢 Locality: {parsedIntent.locality}
                  </Badge>
                )}
                {parsedIntent.city && (
                  <Badge variant="glass" size="sm">
                    🌆 City: {parsedIntent.city}
                  </Badge>
                )}
                {parsedIntent.maxPrice && (
                  <Badge variant="emerald" size="sm">
                    💰 Budget: Up to ₹{parsedIntent.maxPrice.toLocaleString()}
                  </Badge>
                )}
                {parsedIntent.propertyType && (
                  <Badge variant="glass" size="sm">
                    🏠 Type: {parsedIntent.propertyType}
                  </Badge>
                )}
                {parsedIntent.preferredFor && (
                  <Badge variant="rose" size="sm">
                    👥 Gender: {parsedIntent.preferredFor}
                  </Badge>
                )}
                {parsedIntent.roomOccupancy && (
                  <Badge variant="terracotta" size="sm">
                    🛏️ Room: {parsedIntent.roomOccupancy}
                  </Badge>
                )}
                {parsedIntent.mealsRequired && (
                  <Badge variant="emerald" size="sm">
                    🍽️ Meals: Required
                  </Badge>
                )}
                {parsedIntent.furnished && (
                  <Badge variant="emerald" size="sm">
                    ✨ Furnished: Yes
                  </Badge>
                )}
                {parsedIntent.amenities && parsedIntent.amenities.map((a) => (
                  <Badge key={a} variant="sage" size="sm">
                    ⚡ {a}
                  </Badge>
                ))}
                {aiMeta?.topCandidateScore !== undefined && (
                  <Badge variant="emerald" size="sm" className="bg-emerald-500 text-white font-bold">
                    🎯 Top Match Score: {aiMeta.topCandidateScore}%
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Example AI Query Prompt Chips */}
          <div className="space-y-1.5 pt-1">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Try Natural Language Queries:</div>
            <div className="flex flex-wrap gap-2">
              {[
                "Find me a furnished PG near Christ University under ₹12,000 with meals and Wi-Fi",
                "Girls PG in Koramangala with single room and AC under ₹15,000",
                "Co-living studio in HSR Layout with gym & power backup",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(chip);
                    handleAISearch(chip);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[var(--surface-hover)] border border-purple-500/30 hover:border-purple-500 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-purple-600 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <span>&ldquo;{chip}&rdquo;</span>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Grid Layout: Sidebar Filter + Results */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Filter Sidebar (Matching Reference Image Sidebar) */}
          <aside className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6 bg-[var(--surface)] p-5 rounded-3xl border border-[var(--surface-border)] shadow-sm sticky top-24">
            <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
              <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#FF5A36]" /> Filters
              </div>
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#FF5A36] hover:underline font-semibold"
              >
                Clear All
              </button>
            </div>

            {/* City Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
              >
                <option value="all">All Cities</option>
                {CITIES_DATA.map((c) => (
                  <option key={c.id} value={c.name.toLowerCase()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred For */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Preferred For</label>
              <div className="space-y-1.5 text-xs">
                {["Anyone", "Male", "Female"].map((option) => (
                  <label key={option} className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferredFor.includes(option)}
                      onChange={() => togglePreferredFor(option)}
                      className="accent-[#FF5A36] rounded"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Range Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-[var(--text-primary)] uppercase tracking-wider">Max Budget</label>
                <span className="font-bold text-[#FF5A36]">₹{maxPrice.toLocaleString()}/mo</span>
              </div>
              <input
                type="range"
                min="5000"
                max="25000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#FF5A36] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-mono">
                <span>₹5,000</span>
                <span>₹25,000</span>
              </div>
            </div>

            {/* Room Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Room Type</label>
              <div className="space-y-1.5 text-xs">
                {["Single Room", "Shared Room", "Triple Sharing"].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roomTypes.includes(type)}
                      onChange={() => toggleRoomType(type)}
                      className="accent-[#FF5A36] rounded"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Amenities</label>
              <div className="space-y-1.5 text-xs">
                {["Wi-Fi 6", "Meals Included", "Air Conditioning", "Daily Housekeeping", "Power Backup", "Gym Access"].map(
                  (amenity) => (
                    <label key={amenity} className="flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="accent-[#FF5A36] rounded"
                      />
                      <span>{amenity}</span>
                    </label>
                  )
                )}
              </div>
            </div>
          </aside>

          {/* Results Main Content Grid */}
          <main className="md:col-span-8 lg:col-span-9 space-y-6">
            
            {/* Sorting & Filter Summary */}
            <div className="flex items-center justify-between bg-[var(--surface)] p-4 rounded-2xl border border-[var(--surface-border)] text-xs">
              <div className="text-[var(--text-secondary)]">
                Showing <strong className="text-[var(--text-primary)]">{aiCandidates ? aiCandidates.length : filteredProperties.length}</strong> stays
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] font-semibold">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "relevance" | "price-low" | "price-high" | "rating")}
                  className="bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl px-3 py-1.5 font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Property Cards Grid */}
            {(aiCandidates ? aiCandidates.length : filteredProperties.length) === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] p-12 rounded-3xl border border-[var(--surface-border)] text-center space-y-4"
              >
                <Building2 className="h-12 w-12 text-[var(--text-muted)] mx-auto" />
                <h3 className="font-bold text-lg text-[var(--text-primary)]">No properties found matching your search</h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                  Try adjusting your budget range, clearing amenities filters, or searching in a different city.
                </p>
                <Button onClick={clearAllFilters} variant="primary" size="sm" className="bg-[#FF5A36]">
                  Reset All Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {(aiCandidates
                    ? aiCandidates.map((item) => ({
                        property: item.property,
                        id: item.property._id || item.property.id,
                        score: item.ranking?.score as number | undefined,
                        matchReasons: (item.ranking?.matchReasons || []) as string[],
                        startingPrice: item.qualifyingPrice || item.property.startingPrice,
                      }))
                    : filteredProperties.map((property) => ({
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        property: property as Record<string, any>,
                        id: property.id,
                        score: undefined as number | undefined,
                        matchReasons: [] as string[],
                        startingPrice: property.startingPrice,
                      }))
                  ).map(({ property, id, score, matchReasons, startingPrice }, idx) => (
                    <motion.div
                      layout
                      key={id}
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Card
                        enable3DTilt={true}
                        glowOnHover={true}
                        className="group rounded-3xl overflow-hidden border-[var(--surface-border)] bg-[var(--surface)] flex flex-col justify-between h-full relative"
                      >
                        <div>
                          {/* Image Preview Header */}
                          <div className="relative h-48 w-full overflow-hidden">
                            <img
                              src={property.images?.[0] || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                            />

                            {/* Verified & Best Match Pills */}
                            <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap" style={{ transform: "translateZ(20px)" }}>
                              {idx === 0 && aiCandidates && (
                                <Badge variant="emerald" size="sm" className="bg-purple-600 text-white font-extrabold shadow-lg border-purple-400">
                                  ✨ Best Match
                                </Badge>
                              )}
                              {property.verified && (
                                <Badge variant="emerald" size="sm" className="gap-1 shadow-md">
                                  <ShieldCheck className="h-3 w-3" /> Verified
                                </Badge>
                              )}
                              {score !== undefined && (
                                <Badge variant="terracotta" size="sm" className="font-bold shadow-md bg-black/70 text-amber-300 border-amber-500/50">
                                  {score}% Match
                                </Badge>
                              )}
                            </div>

                            {/* Favorite Button */}
                            <button
                              onClick={(e) => toggleFavorite(e, id)}
                              style={{ transform: "translateZ(25px)" }}
                              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-[var(--text-secondary)] hover:text-[#FF5A36] transition-colors shadow-md"
                            >
                              <Heart
                                className={`h-4 w-4 ${
                                  favorites[id] ? "fill-[#FF5A36] text-[#FF5A36]" : ""
                                }`}
                              />
                            </button>

                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1" style={{ transform: "translateZ(20px)" }}>
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span>{property.rating || "New"}</span>
                              <span className="text-[10px] text-white/80">({property.reviewCount || 0})</span>
                            </div>
                          </div>

                          {/* Content */}
                          <CardContent className="p-4 space-y-2">
                            <div className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
                              <span className="truncate">{property.locality}, {property.city}</span>
                            </div>

                            <h3 className="font-display font-bold text-base text-[var(--text-primary)] group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                              {property.title}
                            </h3>

                            <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2">
                              {property.description}
                            </p>

                            {/* Deterministic Match Reasons */}
                            {matchReasons && matchReasons.length > 0 && (
                              <div className="p-2 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-primary)]/20 space-y-1">
                                <div className="text-[9px] uppercase font-bold text-[var(--accent-primary)] flex items-center gap-1">
                                  <Sparkles className="h-2.5 w-2.5" /> Match Highlights
                                </div>
                                <ul className="text-[10px] text-[var(--text-secondary)] space-y-0.5">
                                  {matchReasons.slice(0, 2).map((reason: string, rIdx: number) => (
                                    <li key={rIdx} className="flex items-center gap-1">
                                      <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                                      <span className="truncate">{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-1 pt-1">
                              {(property.amenities || []).slice(0, 3).map((amenity: string, aIdx: number) => (
                                <Badge key={aIdx} variant="glass" size="sm" className="text-[9px]">
                                  {amenity}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </div>

                        {/* Bottom Row */}
                        <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-[var(--surface-border)]">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-[var(--text-muted)]">Starting Rate</div>
                            <div className="text-base font-display font-extrabold text-[#FF5A36]">
                              ₹{property.startingPrice.toLocaleString()}
                              <span className="text-[10px] font-normal text-[var(--text-secondary)]"> /mo</span>
                            </div>
                          </div>

                          <Link
                            href={
                              activeSearchId
                                ? `/properties/${property.slug || id}?searchId=${encodeURIComponent(activeSearchId)}`
                                : `/properties/${property.slug || id}`
                            }
                          >
                            <Button
                              variant="primary"
                              size="sm"
                              className="bg-[#FF5A36] hover:bg-[#E0482B] text-white rounded-xl gap-1 text-xs font-semibold"
                            >
                              <span>Inspect</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </main>
        </div>

        {/* Mobile Filter Drawer Modal */}
        <AnimatePresence>
          {mobileFilterOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end"
            >
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-xs bg-[var(--surface)] h-full p-6 space-y-6 overflow-y-auto"
              >
                <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                  <div className="font-bold text-sm text-[var(--text-primary)]">Filter Stays</div>
                  <button onClick={() => setMobileFilterOpen(false)} className="text-[var(--text-muted)]">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">City</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-2 text-xs text-[var(--text-primary)]"
                  >
                    <option value="all">All Cities</option>
                    {CITIES_DATA.map((c) => (
                      <option key={c.id} value={c.name.toLowerCase()}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <label className="font-bold text-[var(--text-primary)]">Max Budget</label>
                    <span className="font-bold text-[#FF5A36]">₹{maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="25000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#FF5A36]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button onClick={clearAllFilters} variant="outline" size="sm" className="w-full">
                    Reset
                  </Button>
                  <Button onClick={() => setMobileFilterOpen(false)} variant="primary" size="sm" className="w-full bg-[#FF5A36]">
                    Apply Filters
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </MarketplaceShell>
  );
}

export default function BrowsePage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-xs text-[var(--text-muted)]">Loading stays marketplace...</div>}>
      <BrowseContent />
    </React.Suspense>
  );
}

