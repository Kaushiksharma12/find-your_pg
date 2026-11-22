"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Calendar,
  MapPin,
  BedDouble,
  ArrowRight,
  Lock,
  Heart,
  Star,
  UserCheck,
  Clock,
  ChevronRight,
  Compass,
  Users,
} from "lucide-react";

import { MarketplaceShell } from "@/components/shells/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CITIES_DATA, PROPERTIES_DATA } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import {
  containerRevealVariants,
  itemRevealVariants,
  sectionRevealVariants,
  floatingLoopAnimation,
  floatingLoopSecondary,
  gridContainerVariants,
} from "@/lib/motion";

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Search Bar Form State
  const [selectedCity, setSelectedCity] = React.useState("Bangalore");
  const [preferredFor, setPreferredFor] = React.useState("Anyone");
  const [budgetRange, setBudgetRange] = React.useState("under-10k");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Favorites state for property cards
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCity) params.set("city", selectedCity.toLowerCase());
    if (searchQuery) params.set("q", searchQuery);
    router.push(`/browse?${params.toString()}`);
  };

  // Subtle 3D Parallax Hook for Hero Image
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-120, 120], [8, -8]);
  const rotateY = useTransform(x, [-120, 120], [-8, 8]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <MarketplaceShell>
      <div className="space-y-20 pb-16 overflow-hidden">
        
        {/* ================================================== */}
        {/* SECTION 2 — HERO SECTION WITH PARALLAX 3D MOTION   */}
        {/* ================================================== */}
        <section className="relative pt-4 lg:pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <motion.div
              variants={containerRevealVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-7 space-y-6"
            >
              <motion.div variants={itemRevealVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF1EE] dark:bg-[#FF5A36]/15 border border-[#FF5A36]/30 text-[#FF5A36] text-xs font-bold shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#FF5A36]" />
                <span>Verified Student Accommodations & PGs</span>
              </motion.div>

              <motion.h1
                variants={itemRevealVariants}
                className="font-display font-black text-4xl sm:text-6xl tracking-tight text-[var(--text-primary)] leading-[1.1]"
              >
                Find Your Perfect{" "}
                <span className="bg-gradient-to-r from-[#FF6C4B] to-[#FF5A36] bg-clip-text text-transparent">
                  Student Home
                </span>
              </motion.h1>

              <motion.p
                variants={itemRevealVariants}
                className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed max-w-2xl font-sans"
              >
                Discover 100% verified PGs, student hostels, and co-living spaces near India&apos;s top colleges. Transparent pricing, zero broker hassles, and host-approved booking requests.
              </motion.p>

              {/* ================================================== */}
              {/* SECTION 3 — PRIMARY SEARCH BAR                    */}
              {/* ================================================== */}
              <motion.div variants={itemRevealVariants} className="pt-2">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-[var(--surface)] p-4 sm:p-5 rounded-3xl border-2 border-[#FF5A36]/30 shadow-xl shadow-[#FF5A36]/10 space-y-4"
                >
                  {/* Natural Language Query Input */}
                  <div className="relative">
                    <Input
                      type="text"
                      icon={<Search className="h-4 w-4 text-[#FF5A36]" />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by city, college (e.g. MIT-WPU), locality or PG name..."
                      className="bg-[var(--surface-hover)] border-[var(--surface-border)] h-12 text-sm rounded-2xl"
                    />
                  </div>

                  {/* Filter Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">City</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
                      >
                        {CITIES_DATA.map((c) => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Preferred For</label>
                      <select
                        value={preferredFor}
                        onChange={(e) => setPreferredFor(e.target.value)}
                        className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
                      >
                        <option value="Anyone">Anyone (Co-living)</option>
                        <option value="Male">Boys PG</option>
                        <option value="Female">Girls PG</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">Budget Range</label>
                      <select
                        value={budgetRange}
                        onChange={(e) => setBudgetRange(e.target.value)}
                        className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-2.5 text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
                      >
                        <option value="under-10k">Under ₹10,000 / mo</option>
                        <option value="10k-15k">₹10,000 - ₹15,000 / mo</option>
                        <option value="above-15k">₹15,000+ / mo</option>
                      </select>
                    </div>
                  </div>

                  <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      className="w-full bg-[#FF5A36] hover:bg-[#E0482B] text-white font-bold h-12 rounded-2xl gap-2 shadow-lg shadow-[#FF5A36]/30"
                    >
                      <Search className="h-4 w-4" />
                      <span>Search Verified Stays</span>
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>

            {/* Hero Right — Layered 3D Parallax Visual Composition */}
            <div
              className="lg:col-span-5 relative perspective-1000"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-[var(--surface)] bg-[var(--surface)]"
              >
                {/* Main Hero Photo */}
                <div className="relative h-[420px] w-full overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80"
                    alt="FindYourPeace Premium Student Accommodation"
                    fill
                    priority
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  <div className="absolute top-4 left-4" style={{ transform: "translateZ(30px)" }}>
                    <Badge variant="emerald" size="sm" className="shadow-lg backdrop-blur-md">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> VERIFIED PROPERTY
                    </Badge>
                  </div>

                  {/* Overlay Property info */}
                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1" style={{ transform: "translateZ(40px)" }}>
                    <div className="text-xs font-semibold text-amber-400">Bangalore • Koramangala 5th Block</div>
                    <div className="font-display font-extrabold text-xl">Celestial Student Studio</div>
                    <div className="text-xs text-white/80">1.2 km from Christ University • Wi-Fi 6 Included</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 1: Host Rating Badge with Continuous Floating Animation */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: { duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
                }}
                className="absolute -bottom-6 -left-6 z-20 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--surface-border)] shadow-xl flex items-center gap-3"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-bold">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--text-primary)]">4.9 / 5.0 Rating</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Verified Student Reviews</div>
                </div>
              </motion.div>

              {/* Floating Card 2: Starting Price Badge with Continuous Floating Animation */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: [0, 8, 0], opacity: 1 }}
                transition={{
                  opacity: { duration: 0.5 },
                  y: { duration: 4.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: 0.4 },
                }}
                className="absolute -top-6 -right-6 z-20 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--surface-border)] shadow-xl flex items-center gap-3"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="h-10 w-10 rounded-xl bg-[#FFF1EE] dark:bg-[#FF5A36]/15 flex items-center justify-center text-[#FF5A36]">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold text-base text-[#FF5A36]">₹8,500/mo</div>
                  <div className="text-[10px] text-[var(--text-muted)]">Starting Student Rent</div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>


        {/* ================================================== */}
        {/* SECTION 4 — TRUST / VALUE STRIP                   */}
        {/* ================================================== */}
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="py-6 border-y border-[var(--surface-border)] bg-[var(--surface)]/50 rounded-3xl"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">100% Verified Properties</div>
              <div className="text-[10px] text-[var(--text-muted)]">Physical admin security audit</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Safe & Secure Living</div>
              <div className="text-[10px] text-[var(--text-muted)]">CCTV & Warden entry standards</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-[#FFF1EE] dark:bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Student-First Amenities</div>
              <div className="text-[10px] text-[var(--text-muted)]">Wi-Fi 6, Meals & Housekeeping</div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Transparent Booking</div>
              <div className="text-[10px] text-[var(--text-muted)]">Host approval request model</div>
            </div>
          </div>
        </motion.section>

        {/* ================================================== */}
        {/* SECTION 5 — PLATFORM STATS                        */}
        {/* ================================================== */}
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">FindYourPeace Platform Impact</h2>
            <Badge variant="amber" size="sm">DEMO / DESIGN DATA — UI PREVIEW</Badge>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card enable3DTilt={true} glowOnHover={true} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-1">
              <div className="font-display font-black text-3xl sm:text-4xl text-[#FF5A36]">10,000+</div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Happy Students</div>
              <div className="text-[10px] text-[var(--text-muted)] font-sans">Accommodated safely across top colleges</div>
            </Card>

            <Card enable3DTilt={true} glowOnHover={true} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-1">
              <div className="font-display font-black text-3xl sm:text-4xl text-emerald-500">500+</div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Verified Properties</div>
              <div className="text-[10px] text-[var(--text-muted)] font-sans">Audit-approved PGs & studios</div>
            </Card>

            <Card enable3DTilt={true} glowOnHover={true} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-1">
              <div className="font-display font-black text-3xl sm:text-4xl text-[#FF5A36]">25+</div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Major Cities</div>
              <div className="text-[10px] text-[var(--text-muted)] font-sans">Prime student educational hubs</div>
            </Card>

            <Card enable3DTilt={true} glowOnHover={true} className="p-6 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] space-y-1">
              <div className="font-display font-black text-3xl sm:text-4xl text-amber-500">4.8 / 5</div>
              <div className="font-bold text-xs text-[var(--text-primary)]">Average Host Rating</div>
              <div className="text-[10px] text-[var(--text-muted)] font-sans">Based on verified renter reviews</div>
            </Card>
          </div>
        </motion.section>

        {/* ================================================== */}
        {/* SECTION 6 — POPULAR CITIES                        */}
        {/* ================================================== */}
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-primary)]">
                Popular Student Cities
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Explore verified stays in India&apos;s top education hubs.</p>
            </div>
            <Link href="/browse" className="text-xs font-bold text-[#FF5A36] hover:underline inline-flex items-center gap-1">
              <span>View All Cities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CITIES_DATA.map((city) => (
              <Link key={city.id} href={`/browse?city=${city.name.toLowerCase()}`} className="group block">
                <motion.div
                  whileHover={{ y: -6, scale: 1.015 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="relative h-64 rounded-3xl overflow-hidden border border-[var(--surface-border)] shadow-md group-hover:shadow-2xl transition-all duration-300"
                >
                  <Image
                    src={city.image}
                    alt={`PGs in ${city.name}`}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  
                  <div className="absolute bottom-5 left-5 right-5 text-white space-y-1">
                    <div className="font-display font-extrabold text-2xl group-hover:text-amber-400 transition-colors">
                      {city.name}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>{city.propertyCount}+ Verified PGs</span>
                      <span className="font-bold text-amber-300">From ₹{city.startingPrice.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ================================================== */}
        {/* SECTION 7 — FEATURED STAYS                        */}
        {/* ================================================== */}
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--text-primary)]">
                Featured Stays Near You
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Handpicked properties with top safety standards & amenities.</p>
            </div>
            <Link href="/browse" className="text-xs font-bold text-[#FF5A36] hover:underline inline-flex items-center gap-1">
              <span>Browse Marketplace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROPERTIES_DATA.slice(0, 3).map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} className="group block">
                <Card enable3DTilt={true} glowOnHover={true} className="overflow-hidden rounded-3xl border-[var(--surface-border)] bg-[var(--surface)]">
                  {/* Property Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {property.verified && (
                        <Badge variant="emerald" size="sm" className="shadow-md">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> VERIFIED
                        </Badge>
                      )}
                      <Badge variant="amber" size="sm" className="shadow-md">
                        {property.type}
                      </Badge>
                    </div>

                    <button
                      onClick={(e) => toggleFavorite(property.id, e)}
                      className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${favorites[property.id] ? "fill-rose-500 text-rose-500" : "text-white"}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{property.rating} ({property.reviewCount})</span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[#FF5A36] transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-[#FF5A36]" />
                        <span>{property.locality}, {property.city}</span>
                      </div>
                    </div>

                    <div className="text-xs text-[var(--text-muted)] font-medium">
                      {property.distanceFromCollege}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {property.amenities.slice(0, 3).map((am, idx) => (
                        <Badge key={idx} variant="glass" size="sm" className="text-[10px]">
                          {am}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-[var(--surface-border)] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Starting Rent</div>
                        <div className="font-extrabold text-lg text-[#FF5A36]">₹{property.startingPrice.toLocaleString()}<span className="text-xs font-normal text-[var(--text-muted)]">/mo</span></div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] group-hover:translate-x-1 transition-transform">
                        <span>View Details</span>
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* ================================================== */}
        {/* SECTION 8 — HOW FINDYOURPEACE WORKS                */}
        {/* ================================================== */}
        <motion.section
          id="how-it-works"
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="py-12 border-y border-[var(--surface-border)] bg-[var(--surface)]/30 rounded-3xl space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="amber" size="sm">TRANSPARENT WORKFLOW</Badge>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--text-primary)]">
              How FindYourPeace Works
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              A transparent, request-based workflow designed for student convenience & host governance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
            <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-3 relative shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-[#FF5A36] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                1
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">1. Search Stays</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Filter by city, college proximity, room sharing preference, and budget range.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-3 relative shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-[#FF5A36] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                2
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">2. Explore Details</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                View verified property photos, meal menus, room availability, and security measures.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-3 relative shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-[#FF5A36] text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                3
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">3. Schedule Visit</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Book a physical site visit or submit questions directly to the verified property host.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -4 }} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-3 relative shadow-sm">
              <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                4
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">4. Submit Request</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Submit a formal booking request for host approval. No instant auto-confirmations.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* ================================================== */}
        {/* SECTION 9 — SAFETY / TRUST SECTION                */}
        {/* ================================================== */}
        <motion.section
          id="about"
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-[#1C1B19] to-[#141312] p-8 sm:p-12 rounded-3xl border border-[#302E2B] text-white space-y-8 shadow-2xl relative overflow-hidden">
            <div className="max-w-3xl space-y-4">
              <Badge variant="emerald" size="sm">SAFETY & GOVERNANCE</Badge>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-[#FAF7F1]">
                Built for Student Safety & Parent Peace of Mind
              </h2>
              <p className="text-[#B4ADA4] text-xs sm:text-sm leading-relaxed">
                Every accommodation listed on FindYourPeace undergoes administrative verification checks. We prioritize biometric access, 24/7 CCTV surveillance, female warden availability, and transparent rent guidelines.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <motion.div whileHover={{ y: -4 }} className="p-4 rounded-2xl bg-[#242321]/80 border border-[#302E2B] space-y-2">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
                <div className="font-bold text-sm text-[#FAF7F1]">Physical Property Audit</div>
                <div className="text-xs text-[#9E968D]">Admin audit of emergency exits, security cameras & room hygiene before issuing badge.</div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="p-4 rounded-2xl bg-[#242321]/80 border border-[#302E2B] space-y-2">
                <UserCheck className="h-6 w-6 text-amber-400" />
                <div className="font-bold text-sm text-[#FAF7F1]">Verified Host Partners</div>
                <div className="text-xs text-[#9E968D]">Host identity documentation checked to ensure legitimate PG owners.</div>
              </motion.div>

              <motion.div whileHover={{ y: -4 }} className="p-4 rounded-2xl bg-[#242321]/80 border border-[#302E2B] space-y-2">
                <Lock className="h-6 w-6 text-[#FF5A36]" />
                <div className="font-bold text-sm text-[#FAF7F1]">Zero Hidden Terms</div>
                <div className="text-xs text-[#9E968D]">Clear deposit rules, notice period guidelines, and included utility policies.</div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ================================================== */}
        {/* SECTION 10 — OWNER CTA                            */}
        {/* ================================================== */}
        {user?.role !== "renter" && (
          <motion.section
            id="owner-cta"
            variants={sectionRevealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="p-8 sm:p-10 rounded-3xl bg-[var(--surface)] border-2 border-[#FF5A36]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
          >
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#FF5A36]" />
                <span className="font-bold text-xs text-[#FF5A36] uppercase tracking-wider">Host Partner Hub</span>
              </div>
              <h2 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">
                Have a PG or Student Residence? List it on FindYourPeace.
              </h2>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Reach thousands of students looking for verified accommodation near major colleges. Manage your room inventory and incoming booking requests seamlessly.
              </p>
            </div>

            <Button asChild variant="primary" size="md" className="bg-[#FF5A36] hover:bg-[#E0482B] text-white font-bold rounded-2xl px-6 h-12 gap-2 shadow-lg shadow-[#FF5A36]/25 shrink-0">
              <Link href="/owner/properties/new">
                <Building2 className="h-4 w-4" />
                <span>List Your Property</span>
              </Link>
            </Button>
          </motion.section>
        )}

        {/* ================================================== */}
        {/* SECTION 11 — FINAL CTA                            */}
        {/* ================================================== */}
        <motion.section
          variants={sectionRevealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="text-center py-12 px-6 rounded-3xl bg-gradient-to-r from-[#FF6C4B] to-[#FF5A36] text-white space-y-6 shadow-xl"
        >
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight max-w-2xl mx-auto">
            Your next stay is closer than you think.
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-md mx-auto font-medium">
            Join thousands of students finding safe, comfortable, and verified accommodations across India.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asChild variant="secondary" size="md" className="bg-white text-[#FF5A36] hover:bg-[#FAF7F1] font-extrabold rounded-2xl px-6 h-12 shadow-md">
              <Link href="/browse">Explore All Stays</Link>
            </Button>
            {user?.role !== "renter" && (
              <Button asChild variant="outline" size="md" className="border-white text-white hover:bg-white/10 font-bold rounded-2xl px-6 h-12">
                <Link href="/owner/properties/new">List Your Property</Link>
              </Button>
            )}
          </div>
        </motion.section>


      </div>
    </MarketplaceShell>
  );
}

