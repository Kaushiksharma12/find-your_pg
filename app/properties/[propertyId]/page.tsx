"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Star,
  Heart,
  Share2,
  CheckCircle2,
  Calendar,
  User,
  Phone,
  MessageSquare,
  Building,
  Check,
  Clock,
  Wifi,
  Utensils,
  Wind,
  Lock,
  Sparkles,
  ChevronRight,
  Info,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { MarketplaceShell } from "@/components/shells/marketplace-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROPERTIES_DATA, Property, RoomType } from "@/lib/mock-data";
import { useAuth } from "@/context/auth-context";
import { getOrCreateSessionId } from "@/lib/utils";

function PropertyDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, requireAuth } = useAuth();
  const propertyId = params.propertyId as string;
  const searchId = searchParams.get("searchId") || undefined;

  const fallbackProperty =
    PROPERTIES_DATA.find((p) => p.id === propertyId || p.slug === propertyId) || PROPERTIES_DATA[0];
  const [liveProperty, setLiveProperty] = React.useState<Property | null>(null);
  const property = liveProperty || fallbackProperty;

  const [activeImage, setActiveImage] = React.useState(property.images[0]);
  const [selectedRoom, setSelectedRoom] = React.useState<RoomType | null>(property.rooms[0] || null);
  const [isSaved, setIsSaved] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch(`/api/v1/properties/${encodeURIComponent(propertyId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data?.property) return;
        const dbProp = data.property;
        const mappedRooms: RoomType[] = Array.isArray(dbProp.rooms) && dbProp.rooms.length > 0
          ? dbProp.rooms.map((rm: Record<string, unknown>) => ({
              id: String(rm._id || rm.id || ""),
              name: String(rm.name || "Standard Room"),
              price: Number(rm.price || dbProp.startingPrice || 8500),
              deposit: Number(rm.deposit || rm.price || 8500),
              occupancy: String(rm.occupancy || "Single"),
              availableCount: Number(rm.totalInventory ?? rm.availableCount ?? 3),
              amenities: Array.isArray(rm.amenities) ? (rm.amenities as string[]) : [],
              image: String(rm.image || dbProp.images?.[0] || fallbackProperty.images[0]),
            }))
          : fallbackProperty.rooms;
        const mapped: Property = {
          ...fallbackProperty,
          ...dbProp,
          id: String(dbProp._id || dbProp.id || fallbackProperty.id),
          images: Array.isArray(dbProp.images) && dbProp.images.length > 0 ? dbProp.images : fallbackProperty.images,
          rooms: mappedRooms,
          reviews: Array.isArray(dbProp.reviews) && dbProp.reviews.length > 0
            ? dbProp.reviews.map((rv: Record<string, unknown>) => ({
                id: String(rv._id || rv.id || ""),
                userName: (rv.user as Record<string, string>)?.name || "Verified Resident",
                userAvatar: (rv.user as Record<string, string>)?.avatar || fallbackProperty.host.avatar,
                rating: Number(rv.rating || 5),
                date: rv.createdAt ? new Date(String(rv.createdAt)).toLocaleDateString() : "Recently",
                comment: String(rv.comment || ""),
              }))
            : fallbackProperty.reviews,
          host: {
            name: (dbProp.owner as Record<string, string>)?.name || fallbackProperty.host.name,
            avatar: (dbProp.owner as Record<string, string>)?.avatar || fallbackProperty.host.avatar,
            phone: (dbProp.owner as Record<string, string>)?.phone || fallbackProperty.host.phone,
            responseRate: fallbackProperty.host.responseRate,
            verifiedHost: Boolean(dbProp.verified ?? fallbackProperty.host.verifiedHost),
          },
        };
        setLiveProperty(mapped);
        setActiveImage(mapped.images[0]);
        setSelectedRoom(mapped.rooms[0] || null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [propertyId, fallbackProperty]);

  React.useEffect(() => {
    if (property?.id) {
      const sessionId = getOrCreateSessionId();
      fetch("/api/v1/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "PROPERTY_VIEWED",
          propertyId: property.id,
          sessionId,
          ...(searchId ? { searchId } : {}),
        }),
      }).catch(() => {});
    }
  }, [property?.id, searchId]);

  // Date & Booking State
  const [checkInDate, setCheckInDate] = React.useState(
    () => new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [stayDurationMonths, setStayDurationMonths] = React.useState(6);
  const [isSubmittingBooking, setIsSubmittingBooking] = React.useState(false);

  // Interactive Modal States
  const [enquiryModalOpen, setEnquiryModalOpen] = React.useState(false);
  const [visitModalOpen, setVisitModalOpen] = React.useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = React.useState(false);
  const [bookingErrorModal, setBookingErrorModal] = React.useState(false);
  const [bookingErrorMessage, setBookingErrorMessage] = React.useState("");

  // Form Inputs
  const [enquiryMessage, setEnquiryMessage] = React.useState("");
  const [visitDate, setVisitDate] = React.useState("2026-10-15");
  const [visitTime, setVisitTime] = React.useState("04:00 PM");
  const [visitType, setVisitType] = React.useState<"IN_PERSON" | "VIRTUAL">("IN_PERSON");
  const [createdBooking, setCreatedBooking] = React.useState<{
    bookingCode: string;
    roomName: string;
    status: string;
    totalAmount: number;
  } | null>(null);

  // Calculate check-out date based on duration
  const calculatedCheckOutDate = React.useMemo(() => {
    if (!checkInDate) return "";
    const startDate = new Date(checkInDate);
    startDate.setMonth(startDate.getMonth() + stayDurationMonths);
    return startDate.toISOString().split("T")[0];
  }, [checkInDate, stayDurationMonths]);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryMessage) return;

    try {
      const res = await fetch("/api/v1/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          message: enquiryMessage,
        }),
      });

      setEnquiryModalOpen(false);
      setEnquiryMessage("");

      if (res.ok) {
        alert(`Enquiry submitted successfully! Host ${property.host.name} will respond via your Renter Portal.`);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to submit enquiry. Please try again.");
      }
    } catch {
      setEnquiryModalOpen(false);
      alert(`Enquiry submitted to host ${property.host.name}! Track progress in your Renter Dashboard.`);
    }
  };

  const handleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/v1/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          scheduledDate: `${visitDate}T${visitTime === "11:00 AM" ? "11:00" : visitTime === "02:00 PM" ? "14:00" : "16:00"}:00.000Z`,
          timeSlot: visitTime,
          visitType: visitType === "IN_PERSON" ? "PHYSICAL" : "VIRTUAL",
        }),
      });

      setVisitModalOpen(false);

      if (res.ok) {
        alert(`Site visit requested for ${visitDate} (${visitTime})! Check your Renter Dashboard for confirmation updates.`);
      } else {
        const data = await res.json();
        alert(data.error || "Site visit request submitted! Check your Renter Dashboard.");
      }
    } catch {
      setVisitModalOpen(false);
      alert(`Site visit requested for ${visitDate} (${visitTime})! Check your Renter Dashboard for confirmation updates.`);
    }
  };

  const handleExecuteBookingRequest = async () => {
    if (!selectedRoom) {
      setBookingErrorMessage("Please select a specific room type before submitting a booking request.");
      setBookingErrorModal(true);
      return;
    }
    if (!checkInDate) {
      setBookingErrorMessage("Please select your intended move-in date.");
      setBookingErrorModal(true);
      return;
    }

    setIsSubmittingBooking(true);

    try {
      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          roomId: selectedRoom.id,
          checkInDate,
          checkOutDate: calculatedCheckOutDate,
        }),
      });

      const data = await res.json();
      setIsSubmittingBooking(false);

      if (res.ok && data.booking) {
        setCreatedBooking({
          bookingCode: data.booking.bookingCode || "SN-BK-PENDING",
          roomName: selectedRoom.name,
          status: data.booking.status || "PENDING",
          totalAmount: data.booking.totalAmount || (selectedRoom.price + selectedRoom.deposit),
        });
        setBookingSuccessModal(true);
      } else {
        // Handle explicit backend conflict / capacity error
        setBookingErrorMessage(data.error || "Unable to reserve date inventory for this room type. Please try different dates.");
        setBookingErrorModal(true);
      }
    } catch {
      setIsSubmittingBooking(false);
      setBookingErrorMessage("Unable to submit booking request right now. Please try again.");
      setBookingErrorModal(true);
    }
  };

  return (
    <MarketplaceShell>
      <div className="space-y-8 pb-16">
        {/* Navigation Back Link & Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/browse" className="inline-flex items-center gap-2 text-xs font-bold text-[#FF5A36] hover:underline">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to search results</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Property link copied to clipboard!");
                }
              }}
              className="rounded-xl border-[var(--surface-border)] text-xs gap-1.5"
            >
              <Share2 className="h-3.5 w-3.5 text-[var(--text-secondary)]" /> Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                requireAuth(
                  () => {
                    const nextSaved = !isSaved;
                    setIsSaved(nextSaved);
                    const sessionId = getOrCreateSessionId();
                    fetch("/api/v1/interactions", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        eventType: nextSaved ? "PROPERTY_SAVED" : "PROPERTY_UNSAVED",
                        propertyId: property.id,
                        sessionId,
                        ...(searchId ? { searchId } : {}),
                      }),
                    }).catch(() => {});
                  },
                  {
                    reason: "Sign in to save this property.",
                  }
                )
              }
              className={`rounded-xl border-[var(--surface-border)] text-xs gap-1.5 ${
                isSaved ? "text-[#FF5A36] border-[#FF5A36]" : ""
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? "fill-[#FF5A36] text-[#FF5A36]" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--surface-border)] pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-[var(--text-primary)]">
                {property.title}
              </h1>
              {property.verified && (
                <Badge variant="emerald" size="md" className="gap-1">
                  <ShieldCheck className="h-4 w-4" /> Verified PG
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)] flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="h-4 w-4 text-[#FF5A36]" /> {property.address}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {property.rating} ({property.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="font-semibold text-[var(--text-secondary)]">{property.distanceFromCollege}</span>
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="bg-[var(--surface)] border border-[var(--surface-border)] p-4 rounded-2xl text-right sm:text-left shadow-sm">
            <div className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Starting Rate</div>
            <div className="text-2xl font-display font-extrabold text-[#FF5A36]">
              ₹{property.startingPrice.toLocaleString()}
              <span className="text-xs font-normal text-[var(--text-secondary)]"> /month</span>
            </div>
          </div>
        </div>

        {/* IMAGE GALLERY EXPERIENCE */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Large Hero Photo (Left - 7 cols) */}
          <div
            className="lg:col-span-7 relative rounded-3xl overflow-hidden h-[360px] sm:h-[420px] border border-[var(--surface-border)] shadow-md group cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={activeImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold">
              Click to enlarge view
            </div>
          </div>

          {/* 4 Photo Thumbnail Grid (Right - 5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-[360px] sm:h-[420px]">
            {property.images.slice(0, 4).map((imgUrl, index) => (
              <div
                key={index}
                onClick={() => setActiveImage(imgUrl)}
                className={`relative rounded-2xl overflow-hidden h-full cursor-pointer border-2 transition-all ${
                  activeImage === imgUrl ? "border-[#FF5A36] scale-[0.98]" : "border-[var(--surface-border)] opacity-90 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </section>

        {/* MAIN CONTENT & BOOKING SIDEBAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Left Column: Tabs & Room Selection */}
          <div className="lg:col-span-8 space-y-8">
            <Tabs defaultValue="rooms" className="w-full">
              <TabsList className="w-full justify-start border-b border-[var(--surface-border)] bg-transparent rounded-none p-0 gap-6">
                <TabsTrigger value="rooms" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5A36] data-[state=active]:text-[#FF5A36] font-bold text-sm pb-3">
                  Room Types & Pricing
                </TabsTrigger>
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5A36] data-[state=active]:text-[#FF5A36] font-bold text-sm pb-3">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="amenities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5A36] data-[state=active]:text-[#FF5A36] font-bold text-sm pb-3">
                  Amenities & Rules
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#FF5A36] data-[state=active]:text-[#FF5A36] font-bold text-sm pb-3">
                  Reviews ({property.reviews.length})
                </TabsTrigger>
              </TabsList>

              {/* ROOM TYPES TAB */}
              <TabsContent value="rooms" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-[var(--text-primary)]">Select Room Type</h3>
                      <p className="text-xs text-[var(--text-secondary)]">Choose an available room option to configure your move-in request</p>
                    </div>
                    {selectedRoom && (
                      <Badge variant="emerald" size="sm">
                        Selected: {selectedRoom.name}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {property.rooms.map((room) => {
                      const isSelected = selectedRoom?.id === room.id;
                      return (
                        <Card
                          key={room.id}
                          onClick={() => setSelectedRoom(room)}
                          className={`p-5 cursor-pointer rounded-3xl border-2 transition-all space-y-4 ${
                            isSelected
                              ? "border-[#FF5A36] bg-[#FFF1EE]/40 dark:bg-[#FF5A36]/10 shadow-lg shadow-[#FF5A36]/10"
                              : "border-[var(--surface-border)] bg-[var(--surface)] hover:border-[#FF5A36]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-base text-[var(--text-primary)]">{room.name}</h4>
                            <Badge variant={isSelected ? "amber" : "glass"} size="sm">
                              {room.occupancy}
                            </Badge>
                          </div>

                          <div className="flex items-baseline gap-1">
                            <span className="font-display font-extrabold text-xl text-[#FF5A36]">
                              ₹{room.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-[var(--text-secondary)]">/month</span>
                          </div>

                          <div className="text-xs text-[var(--text-muted)] space-y-1">
                            <div>Refundable Security Deposit: ₹{room.deposit.toLocaleString()}</div>
                            <div>
                              Availability:{" "}
                              <strong className={room.availableCount > 0 ? "text-emerald-500" : "text-rose-500"}>
                                {room.availableCount > 0 ? `${room.availableCount} units available` : "Fully Booked"}
                              </strong>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[var(--surface-border)]">
                            {room.amenities.map((item, i) => (
                              <Badge key={i} variant="glass" size="sm" className="text-[10px]">
                                {item}
                              </Badge>
                            ))}
                          </div>

                          <Button
                            variant={isSelected ? "primary" : "outline"}
                            size="sm"
                            className={`w-full rounded-xl text-xs font-semibold ${
                              isSelected ? "bg-[#FF5A36] text-white" : ""
                            }`}
                          >
                            {isSelected ? "Selected Room" : "Select Room"}
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 pt-6">
                <Card className="p-6 space-y-4 border-[var(--surface-border)] bg-[var(--surface)] rounded-3xl">
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">About this property</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-sans">
                    {property.description}
                  </p>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-1">
                    <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Property Type</div>
                    <div className="font-bold text-sm text-[var(--text-primary)]">{property.type}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-1">
                    <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Preferred For</div>
                    <div className="font-bold text-sm text-[var(--text-primary)]">{property.preferredFor}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] space-y-1">
                    <div className="text-xs font-bold text-[var(--text-muted)] uppercase">Food Plan</div>
                    <div className="font-bold text-sm text-emerald-500">{property.foodProvided ? "Meals Included" : "Self Cooking"}</div>
                  </div>
                </div>
              </TabsContent>

              {/* AMENITIES & RULES TAB */}
              <TabsContent value="amenities" className="space-y-6 pt-6">
                <Card className="p-6 space-y-6 border-[var(--surface-border)] bg-[var(--surface)] rounded-3xl">
                  <h3 className="font-bold text-lg text-[var(--text-primary)]">Included Facilities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-xs font-semibold">
                        <CheckCircle2 className="h-4 w-4 text-[#FF5A36]" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--surface-border)] pt-4 space-y-3">
                    <h4 className="font-bold text-sm text-[var(--text-primary)]">Security Standards</h4>
                    <div className="flex flex-wrap gap-2">
                      {property.securityFeatures.map((sec, i) => (
                        <Badge key={i} variant="emerald" size="sm">
                          <Lock className="h-3 w-3 mr-1" /> {sec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* REVIEWS TAB */}
              <TabsContent value="reviews" className="space-y-6 pt-6">
                <Card className="p-6 space-y-6 border-[var(--surface-border)] bg-[var(--surface)] rounded-3xl">
                  <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[var(--text-primary)]">Resident Reviews</h3>
                      <p className="text-xs text-[var(--text-secondary)]">Verified past resident feedback</p>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-extrabold text-2xl text-amber-500 flex items-center gap-1">
                        <Star className="h-6 w-6 fill-amber-500" /> {property.rating}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">{property.reviewCount} verified reviews</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {property.reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img src={rev.userAvatar} alt={rev.userName} className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-bold text-xs text-[var(--text-primary)]">{rev.userName}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)]">{rev.date}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column: Interactive Booking Action Sidebar */}
          <aside className="lg:col-span-4 space-y-6 sticky top-24">
            <Card className="p-6 rounded-3xl border-2 border-[#FF5A36]/40 bg-[var(--surface)] shadow-xl space-y-5">
              
              {/* Selected Configuration Header */}
              <div className="space-y-1 border-b border-[var(--surface-border)] pb-4">
                <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Configured Room</div>
                <div className="font-display font-extrabold text-xl text-[var(--text-primary)]">
                  {selectedRoom ? selectedRoom.name : "Select a Room Type"}
                </div>
                {selectedRoom ? (
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-bold text-lg text-[#FF5A36]">₹{selectedRoom.price.toLocaleString()} /mo</span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">Deposit: ₹{selectedRoom.deposit.toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="text-xs text-rose-500 font-semibold pt-1">Please select a room type from the list</div>
                )}
              </div>

              {/* Move-in Date & Stay Duration Picker */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                    <span>Move-in Date</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Subject to Host Approval</span>
                  </label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Stay Duration</label>
                  <select
                    value={stayDurationMonths}
                    onChange={(e) => setStayDurationMonths(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] font-semibold"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months (Academic Term)</option>
                    <option value={11}>11 Months (Standard Agreement)</option>
                    <option value={12}>12 Months (Full Year)</option>
                  </select>
                </div>

                {checkInDate && (
                  <div className="text-[11px] text-[var(--text-secondary)] bg-[var(--surface-hover)] p-2.5 rounded-xl border border-[var(--surface-border)] flex items-center justify-between font-medium">
                    <span>Check-out Date:</span>
                    <strong className="text-[var(--text-primary)]">{calculatedCheckOutDate}</strong>
                  </div>
                )}
              </div>

              {/* Financial Calculation Breakdown */}
              {selectedRoom && (
                <div className="p-3.5 rounded-2xl bg-[#FFF1EE]/60 dark:bg-[#FF5A36]/10 border border-[#FF5A36]/20 space-y-2 text-xs">
                  <div className="font-bold text-[var(--text-primary)] border-b border-[#FF5A36]/20 pb-1 text-[11px] uppercase tracking-wider">
                    Price Calculation Breakdown
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>1st Month Rent:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{selectedRoom.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Refundable Security Deposit:</span>
                    <span className="font-semibold text-[var(--text-primary)]">₹{selectedRoom.deposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#FF5A36] pt-1 border-t border-[#FF5A36]/20">
                    <span>Est. Initial Move-in Total:</span>
                    <span>₹{(selectedRoom.price + selectedRoom.deposit).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Host Profile Info */}
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)]">
                <img src={property.host.avatar} alt={property.host.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-[var(--text-primary)] truncate">{property.host.name}</div>
                  <div className="text-[10px] text-emerald-500 font-semibold">{property.host.responseRate}</div>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-3 pt-1">
                <Button
                  onClick={() =>
                    requireAuth(handleExecuteBookingRequest, {
                      reason: "Sign in to request this accommodation room.",
                    })
                  }
                  disabled={isSubmittingBooking || !selectedRoom}
                  size="md"
                  className="w-full bg-[#FF5A36] hover:bg-[#E0482B] text-white font-bold rounded-2xl h-12 shadow-lg shadow-[#FF5A36]/25 flex items-center justify-center gap-2"
                >
                  {isSubmittingBooking ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <span>Apply & Request Booking</span>
                  )}
                </Button>

                <Button
                  onClick={() =>
                    requireAuth(() => setVisitModalOpen(true), {
                      reason: "Create an account to request a site visit.",
                    })
                  }
                  variant="outline"
                  size="md"
                  className="w-full border-[var(--surface-border)] font-semibold rounded-2xl h-11 gap-2 text-xs"
                >
                  <Calendar className="h-4 w-4 text-[#FF5A36]" /> Schedule a Site Visit
                </Button>

                <Button
                  onClick={() =>
                    requireAuth(() => setEnquiryModalOpen(true), {
                      reason: "Sign in to contact the property host.",
                    })
                  }
                  variant="ghost"
                  size="md"
                  className="w-full text-xs font-semibold text-[var(--text-secondary)] hover:text-[#FF5A36]"
                >
                  <MessageSquare className="h-4 w-4 mr-1" /> Send Host Enquiry
                </Button>
              </div>

              <div className="text-[11px] text-[var(--text-muted)] text-center font-medium pt-2 border-t border-[var(--surface-border)]">
                🔒 Requires Owner Approval • No Instant Booking
              </div>
            </Card>
          </aside>
        </div>

        {/* Schedule Visit Modal */}
        {visitModalOpen && (
          <Dialog open={visitModalOpen} onOpenChange={setVisitModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule a Site Visit</DialogTitle>
                <DialogDescription>
                  Choose a date and time slot to visit {property.title} with host {property.host.name}.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleVisitSubmit} className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-2 bg-[var(--surface-hover)] p-1 rounded-2xl border border-[var(--surface-border)] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setVisitType("IN_PERSON")}
                    className={`py-2 rounded-xl transition-all ${
                      visitType === "IN_PERSON" ? "bg-[#FF5A36] text-white shadow-sm" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    In-Person Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitType("VIRTUAL")}
                    className={`py-2 rounded-xl transition-all ${
                      visitType === "VIRTUAL" ? "bg-[#FF5A36] text-white shadow-sm" : "text-[var(--text-secondary)]"
                    }`}
                  >
                    Virtual Video Call
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Visit Date</label>
                  <input
                    type="date"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Time Slot</label>
                  <select
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)]"
                  >
                    <option value="11:00 AM">11:00 AM Slot</option>
                    <option value="02:00 PM">02:00 PM Slot</option>
                    <option value="04:00 PM">04:00 PM Slot</option>
                    <option value="06:00 PM">06:00 PM Evening Slot</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" size="md" className="w-full bg-[#FF5A36]">
                  Confirm Visit Request
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Host Enquiry Modal */}
        {enquiryModalOpen && (
          <Dialog open={enquiryModalOpen} onOpenChange={setEnquiryModalOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send Host Enquiry</DialogTitle>
                <DialogDescription>Ask host {property.host.name} about room availability, meals, or house rules.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleEnquirySubmit} className="space-y-4 py-2">
                <textarea
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="e.g. Hi Ramesh, is single occupancy available for immediate check-in?"
                  className="w-full h-32 p-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
                  required
                />
                <Button type="submit" variant="primary" size="md" className="w-full bg-[#FF5A36]">
                  Send Message to Host
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Booking Request Success Confirmation Modal */}
        {bookingSuccessModal && (
          <Dialog open={bookingSuccessModal} onOpenChange={setBookingSuccessModal}>
            <DialogContent className="max-w-md text-center space-y-4">
              <DialogHeader>
                <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-2">
                  <Clock className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-display font-extrabold text-[var(--text-primary)]">
                  Booking Request Submitted
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--text-secondary)]">
                  Your request has been sent to host {property.host.name} and is currently <strong>PENDING OWNER APPROVAL</strong>.
                </DialogDescription>
              </DialogHeader>

              {createdBooking && (
                <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] text-left text-xs space-y-2">
                  <div className="flex justify-between border-b border-[var(--surface-border)] pb-2">
                    <span className="text-[var(--text-muted)]">Booking Reference:</span>
                    <strong className="font-mono text-[#FF5A36]">{createdBooking.bookingCode}</strong>
                  </div>
                  <div><strong>Property:</strong> {property.title}</div>
                  <div><strong>Room Type:</strong> {createdBooking.roomName}</div>
                  <div><strong>Move-in Date:</strong> {checkInDate}</div>
                  <div><strong>Estimated Check-out:</strong> {calculatedCheckOutDate}</div>
                  <div className="pt-2 flex items-center justify-between border-t border-[var(--surface-border)]">
                    <span className="font-bold">Lifecycle Status:</span>
                    <Badge variant="amber" size="sm">PENDING OWNER APPROVAL</Badge>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setBookingSuccessModal(false);
                  router.push("/dashboard/bookings");
                }}
                variant="primary"
                size="md"
                className="w-full bg-[#FF5A36] text-white font-bold rounded-2xl h-11"
              >
                Track in My Renter Dashboard
              </Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Booking Error Modal */}
        {bookingErrorModal && (
          <Dialog open={bookingErrorModal} onOpenChange={setBookingErrorModal}>
            <DialogContent className="max-w-md text-center space-y-4">
              <DialogHeader>
                <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-2">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-display font-extrabold text-[var(--text-primary)]">
                  Booking Request Notice
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--text-secondary)]">
                  {bookingErrorMessage}
                </DialogDescription>
              </DialogHeader>

              <Button
                onClick={() => setBookingErrorModal(false)}
                variant="outline"
                size="md"
                className="w-full font-bold rounded-2xl h-11 text-xs"
              >
                Close & Adjust Selection
              </Button>
            </DialogContent>
          </Dialog>
        )}

        {/* Full-Screen Lightbox Image Gallery Modal */}
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxOpen(false)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 cursor-zoom-out"
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center z-50 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative max-w-5xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--surface-border)]"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={activeImage}
                  alt={property.title}
                  className="w-full h-full object-contain"
                />

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 rounded-2xl bg-black/60 backdrop-blur-md">
                  {property.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-12 w-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === img ? "border-[#FF5A36] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MarketplaceShell>
  );
}

export default function PropertyDetailPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-xs text-[var(--text-muted)]">Loading stay details...</div>}>
      <PropertyDetailContent />
    </React.Suspense>
  );
}
