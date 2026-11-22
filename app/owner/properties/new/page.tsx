"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  Image as ImageIcon,
  ShieldCheck,
  Utensils,
  FileText,
  Eye,
  Sparkles,
  Upload,
  Trash2,
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { OwnerShell } from "@/components/shells/owner-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CITIES_DATA } from "@/lib/mock-data";

interface CustomRoomType {
  name: string;
  price: number;
  deposit: number;
  occupancy: string;
  totalInventory: number;
  amenities: string[];
}

interface UploadedMediaItem {
  id: string;
  previewUrl: string; // Blob preview URL
  persistentUrl?: string; // Persistent URI returned by upload API
  file?: File;
  isCover: boolean;
  uploading: boolean;
  error?: string;
}

export default function CreatePropertyWizardPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionSuccessModal, setSubmissionSuccessModal] = React.useState(false);

  // Drag & Drop state
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    title: "",
    type: "Co-living",
    preferredFor: "Anyone",
    description: "",

    // Step 2: Location
    address: "",
    locality: "",
    city: "Bangalore",
    pincode: "",
    nearbyCollege: "",
    nearbyTransport: "",

    // Step 3: Photos
    mediaItems: [
      {
        id: "default-1",
        previewUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        persistentUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
        isCover: true,
        uploading: false,
      },
    ] as UploadedMediaItem[],

    // Step 4: Rooms & Pricing
    roomTypes: [
      {
        name: "Single Deluxe Room",
        price: 12000,
        deposit: 12000,
        occupancy: "Single",
        totalInventory: 3,
        amenities: ["Attached Bath", "Study Desk", "Balcony"],
      },
      {
        name: "Double Sharing Room",
        price: 8500,
        deposit: 8500,
        occupancy: "2 Sharing",
        totalInventory: 6,
        amenities: ["High-speed Wi-Fi", "Daily Cleaning", "Personal Locker"],
      },
    ] as CustomRoomType[],

    // Step 5: Amenities & Security
    amenities: ["Wi-Fi 6", "Daily Housekeeping", "Power Backup", "Air Conditioning", "Washing Machines"],
    securityFeatures: ["24/7 CCTV Surveillance", "Biometric Door Lock", "Resident Warden Entry Gate"],

    // Step 6: Meals
    mealsIncluded: true,
    breakfast: true,
    lunch: true,
    dinner: true,
    mealType: "Veg & Non-Veg Options",
    mealDescription: "Nutritious 3-time daily meals prepared fresh by in-house chefs.",

    // Step 7: Rules & Policies
    curfewTime: "10:30 PM",
    visitorPolicy: "Visitors allowed in common lobby until 8:00 PM",
    smokingAllowed: false,
    petsAllowed: false,
    minimumStayMonths: 3,
    noticePeriodDays: 30,
    cancellationPolicy: "Full deposit refund if cancelled 15 days prior to check-in.",
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 9));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Step 3: Photo Upload Handlers
  const handleFilesAdded = async (files: FileList | File[]) => {
    const newItems: UploadedMediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const previewUrl = URL.createObjectURL(file);
      newItems.push({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        previewUrl,
        file,
        isCover: formData.mediaItems.length === 0 && i === 0,
        uploading: true,
      });
    }

    if (newItems.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      mediaItems: [...prev.mediaItems, ...newItems],
    }));

    // Trigger upload API to convert files into persistent media URIs
    const uploadBody = new FormData();
    newItems.forEach((item) => {
      if (item.file) uploadBody.append("files", item.file);
    });

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: uploadBody,
      });

      const data = await res.json();
      if (res.ok && data.urls) {
        setFormData((prev) => ({
          ...prev,
          mediaItems: prev.mediaItems.map((item) => {
            const indexInNew = newItems.findIndex((n) => n.id === item.id);
            if (indexInNew !== -1 && data.urls[indexInNew]) {
              return {
                ...item,
                persistentUrl: data.urls[indexInNew],
                uploading: false,
              };
            }
            return item;
          }),
        }));
      } else {
        // Fallback to local object URL
        setFormData((prev) => ({
          ...prev,
          mediaItems: prev.mediaItems.map((item) => ({ ...item, uploading: false })),
        }));
      }
    } catch {
      setFormData((prev) => ({
        ...prev,
        mediaItems: prev.mediaItems.map((item) => ({ ...item, uploading: false })),
      }));
    }
  };

  const handleSetCover = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      mediaItems: prev.mediaItems.map((item) => ({
        ...item,
        isCover: item.id === id,
      })),
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setFormData((prev) => {
      const filtered = prev.mediaItems.filter((item) => item.id !== id);
      if (filtered.length > 0 && !filtered.some((m) => m.isCover)) {
        filtered[0].isCover = true;
      }
      return { ...prev, mediaItems: filtered };
    });
  };

  const handleMovePhoto = (index: number, direction: "up" | "down") => {
    const newItems = [...formData.mediaItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;

    setFormData((prev) => ({ ...prev, mediaItems: newItems }));
  };

  // Step 4: Room Builder Handlers
  const handleAddRoomType = () => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          name: "Triple Sharing Room",
          price: 6500,
          deposit: 6500,
          occupancy: "3 Sharing",
          totalInventory: 4,
          amenities: ["Wi-Fi", "Daily Cleaning"],
        },
      ],
    }));
  };

  const handleRemoveRoomType = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, idx) => idx !== index),
    }));
  };

  const toggleAmenity = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter((a) => a !== item)
        : [...prev.amenities, item],
    }));
  };

  // Final Submission
  const handleSubmitProperty = async () => {
    setIsSubmitting(true);

    const imageArray = formData.mediaItems.map((m) => m.persistentUrl || m.previewUrl);
    const computedStartingPrice =
      formData.roomTypes.length > 0
        ? Math.min(...formData.roomTypes.map((rt) => Number(rt.price) || 8500))
        : 8500;
    const normalizedPreferredFor =
      formData.preferredFor === "Male" || formData.preferredFor === "Female"
        ? formData.preferredFor
        : "Anyone";

    try {
      const res = await fetch("/api/v1/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title || "FindYourPeace Accommodation",
          type: formData.type,
          city: formData.city,
          locality: formData.locality,
          address: formData.address,
          distanceFromCollege: formData.nearbyCollege,
          startingPrice: computedStartingPrice,
          preferredFor: normalizedPreferredFor,
          description:
            formData.description && formData.description.length >= 10
              ? formData.description
              : "Modern student accommodation with verified facilities and high-speed Wi-Fi.",
          images: imageArray,
          amenities: formData.amenities,
          securityFeatures: formData.securityFeatures,
          foodProvided: formData.mealsIncluded,
          houseRules: [
            `Curfew: ${formData.curfewTime}`,
            formData.visitorPolicy,
            formData.smokingAllowed ? "Smoking Allowed" : "No Smoking",
            formData.petsAllowed ? "Pets Allowed" : "No Pets",
          ],
        }),
      });

      const data = await res.json();

      if (res.ok && data.property?._id) {
        for (const rt of formData.roomTypes) {
          await fetch(`/api/v1/properties/${data.property._id}/rooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: rt.name,
              price: Number(rt.price) || computedStartingPrice,
              deposit: Number(rt.deposit) || computedStartingPrice,
              occupancy: rt.occupancy,
              totalInventory: Number(rt.totalInventory) || 5,
              amenities: rt.amenities,
            }),
          }).catch(() => {});
        }
        setIsSubmitting(false);
        setSubmissionSuccessModal(true);
      } else {
        setIsSubmitting(false);
        alert(data.error || "Failed to create property listing. Please review required fields.");
      }
    } catch {
      setIsSubmitting(false);
      alert("Failed to submit property listing. Please check your connection.");
    }
  };

  const STEP_TITLES = [
    "Basic Information",
    "Location & Transit",
    "Photos & Visual Media",
    "Room Types & Inventory",
    "Amenities & Security",
    "Meals & Dining Options",
    "House Rules & Policies",
    "Listing Preview",
    "Submit for Verification",
  ];

  return (
    <OwnerShell>
      <div className="space-y-6 max-w-4xl mx-auto pb-16">
        {/* Progress Header */}
        <div className="space-y-4 border-b border-[var(--surface-border)] pb-6">
          <div className="flex items-center justify-between">
            <Link href="/owner/properties" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5A36] hover:underline">
              <ArrowLeft className="h-4 w-4" /> Back to My Properties
            </Link>
            <Badge variant="emerald" size="sm">
              Step {step} of 9 — {STEP_TITLES[step - 1]}
            </Badge>
          </div>

          <h1 className="font-display font-extrabold text-2xl text-[var(--text-primary)]">
            Create Accommodation Listing
          </h1>

          {/* Step Indicator Bar */}
          <div className="h-2 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-[#FF5A36] transition-all duration-300"
              style={{ width: `${(step / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card className="p-6 sm:p-8 rounded-3xl border-[var(--surface-border)] bg-[var(--surface)] shadow-lg space-y-6">
          
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-[#FF5A36]" /> Step 1: Basic Information
              </h2>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-primary)]">Property Name / Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Grand Campus Heights Student PG"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Accommodation Category</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-3 text-xs text-[var(--text-primary)] font-semibold"
                  >
                    <option value="Boys PG">Boys PG</option>
                    <option value="Girls PG">Girls PG</option>
                    <option value="Co-living">Co-living Space</option>
                    <option value="Luxury Studio">Luxury Studio</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Preferred Tenant Type</label>
                  <select
                    value={formData.preferredFor}
                    onChange={(e) => setFormData({ ...formData, preferredFor: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-3 text-xs text-[var(--text-primary)] font-semibold"
                  >
                    <option value="Anyone">Anyone (Co-ed / All Students)</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-primary)]">Property Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your PG, nearby institutions, atmosphere, and house highlights..."
                  className="w-full h-28 p-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-hover)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#FF5A36]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Location & Transit */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#FF5A36]" /> Step 2: Location & Nearby Transit
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">City</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-xl p-3 text-xs text-[var(--text-primary)] font-semibold"
                  >
                    {CITIES_DATA.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Locality / Sector</label>
                  <Input
                    value={formData.locality}
                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                    placeholder="e.g. Koramangala 5th Block"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Pincode</label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="e.g. 560095"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-primary)]">Full Street Address</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Plot/Building No, Street Name, Landmark"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Nearby University / College</label>
                  <Input
                    value={formData.nearbyCollege}
                    onChange={(e) => setFormData({ ...formData, nearbyCollege: e.target.value })}
                    placeholder="e.g. 0.8 km from Christ University"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Nearby Public Transport</label>
                  <Input
                    value={formData.nearbyTransport}
                    onChange={(e) => setFormData({ ...formData, nearbyTransport: e.target.value })}
                    placeholder="e.g. 300m from Sony World Bus Stop"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Photos & Visual Media Uploader */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-[#FF5A36]" /> Step 3: Photos & Visual Media
                </h2>
                <p className="text-xs text-[var(--text-secondary)] pt-1">
                  Upload multiple property photos. Choose a cover image, reorder cards, and preview media.
                </p>
              </div>

              {/* Visual Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all space-y-3 ${
                  isDragging
                    ? "border-[#FF5A36] bg-[#FFF1EE]/50 dark:bg-[#FF5A36]/10"
                    : "border-[var(--surface-border)] bg-[var(--surface-hover)] hover:border-[#FF5A36]/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFilesAdded(e.target.files);
                  }}
                />

                <div className="h-12 w-12 rounded-full bg-[#FFF1EE] dark:bg-[#FF5A36]/20 text-[#FF5A36] flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-sm text-[var(--text-primary)]">
                    Drag & drop property images here, or <span className="text-[#FF5A36]">browse files</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Supports JPG, PNG, WEBP (Max 5MB per file). Upload exterior, room, and dining photos.
                  </div>
                </div>
              </div>

              {/* Thumbnail Grid with Reordering & Cover Badge */}
              {formData.mediaItems.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                    <span>Uploaded Media ({formData.mediaItems.length})</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Click star to set Cover Image</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {formData.mediaItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`relative group rounded-2xl overflow-hidden border-2 h-36 bg-[var(--surface-hover)] transition-all ${
                          item.isCover ? "border-[#FF5A36] ring-2 ring-[#FF5A36]/30" : "border-[var(--surface-border)]"
                        }`}
                      >
                        <img src={item.previewUrl} alt="Property Upload" className="w-full h-full object-cover" />

                        {/* Cover Badge */}
                        {item.isCover && (
                          <div className="absolute top-2 left-2 bg-[#FF5A36] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                            <Star className="h-3 w-3 fill-white" /> COVER
                          </div>
                        )}

                        {/* Loading Overlay */}
                        {item.uploading && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs gap-1">
                            <Loader2 className="h-4 w-4 animate-spin text-[#FF5A36]" />
                            <span>Processing...</span>
                          </div>
                        )}

                        {/* Action Toolbar */}
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md p-1 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity">
                          {!item.isCover && (
                            <button
                              type="button"
                              onClick={() => handleSetCover(item.id)}
                              title="Make Cover Photo"
                              className="h-7 w-7 rounded-lg bg-white/20 hover:bg-[#FF5A36] text-white flex items-center justify-center text-xs"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(idx, "up")}
                            disabled={idx === 0}
                            title="Move Left"
                            className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white flex items-center justify-center"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMovePhoto(idx, "down")}
                            disabled={idx === formData.mediaItems.length - 1}
                            title="Move Right"
                            className="h-7 w-7 rounded-lg bg-white/20 hover:bg-white/40 disabled:opacity-30 text-white flex items-center justify-center"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(item.id)}
                            title="Remove Photo"
                            className="h-7 w-7 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Dynamic Room Types & Inventory */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-[#FF5A36]" /> Step 4: Room Types & Pricing
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">Create room configurations with rent, deposit, and physical inventory caps.</p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddRoomType}
                  variant="primary"
                  size="sm"
                  className="bg-[#FF5A36] text-white rounded-xl text-xs gap-1 font-bold"
                >
                  <Plus className="h-4 w-4" /> Add Room Type
                </Button>
              </div>

              <div className="space-y-4">
                {formData.roomTypes.map((rt, idx) => (
                  <Card key={idx} className="p-4 sm:p-5 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-hover)] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[var(--text-primary)] flex items-center gap-2">
                        <span>Room Type #{idx + 1}</span>
                        <Badge variant="amber" size="sm">{rt.occupancy}</Badge>
                      </div>
                      {formData.roomTypes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRoomType(idx)}
                          className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Room Title</label>
                        <Input
                          value={rt.name}
                          onChange={(e) => {
                            const updated = [...formData.roomTypes];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, roomTypes: updated });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Monthly Rent (₹)</label>
                        <Input
                          type="number"
                          value={rt.price}
                          onChange={(e) => {
                            const updated = [...formData.roomTypes];
                            updated[idx].price = Number(e.target.value);
                            setFormData({ ...formData, roomTypes: updated });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Deposit (₹)</label>
                        <Input
                          type="number"
                          value={rt.deposit}
                          onChange={(e) => {
                            const updated = [...formData.roomTypes];
                            updated[idx].deposit = Number(e.target.value);
                            setFormData({ ...formData, roomTypes: updated });
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Total Inventory Count</label>
                        <Input
                          type="number"
                          value={rt.totalInventory}
                          onChange={(e) => {
                            const updated = [...formData.roomTypes];
                            updated[idx].totalInventory = Number(e.target.value);
                            setFormData({ ...formData, roomTypes: updated });
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Amenities & Security */}
          {step === 5 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#FF5A36]" /> Step 5: Included Amenities & Security Features
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  "Wi-Fi 6",
                  "Daily Housekeeping",
                  "Power Backup",
                  "Air Conditioning",
                  "Washing Machines",
                  "Refrigerators",
                  "Study Lounge",
                  "Gaming Zone",
                  "Gym Facilities",
                ].map((item) => {
                  const isChecked = formData.amenities.includes(item);
                  return (
                    <div
                      key={item}
                      onClick={() => toggleAmenity(item)}
                      className={`p-3 rounded-2xl border cursor-pointer font-semibold flex items-center gap-2 transition-all ${
                        isChecked
                          ? "border-[#FF5A36] bg-[#FFF1EE]/50 dark:bg-[#FF5A36]/10 text-[#FF5A36]"
                          : "border-[var(--surface-border)] bg-[var(--surface-hover)] text-[var(--text-secondary)]"
                      }`}
                    >
                      <CheckCircle2 className={`h-4 w-4 ${isChecked ? "text-[#FF5A36]" : "opacity-30"}`} />
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Meals & Dining Options */}
          {step === 6 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Utensils className="h-5 w-5 text-[#FF5A36]" /> Step 6: Meals & Dining Options
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mealsIncluded}
                    onChange={(e) => setFormData({ ...formData, mealsIncluded: e.target.checked })}
                    className="accent-[#FF5A36] h-4 w-4"
                  />
                  <span>Food & Meals Included in Property Package</span>
                </label>

                {formData.mealsIncluded && (
                  <div className="p-4 rounded-2xl bg-[var(--surface-hover)] border border-[var(--surface-border)] space-y-4 text-xs">
                    <div className="flex gap-4">
                      {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                        <label key={meal} className="flex items-center gap-2 cursor-pointer font-semibold">
                          <input
                            type="checkbox"
                            checked={meal === "Breakfast" ? formData.breakfast : meal === "Lunch" ? formData.lunch : formData.dinner}
                            onChange={(e) => {
                              if (meal === "Breakfast") setFormData({ ...formData, breakfast: e.target.checked });
                              if (meal === "Lunch") setFormData({ ...formData, lunch: e.target.checked });
                              if (meal === "Dinner") setFormData({ ...formData, dinner: e.target.checked });
                            }}
                            className="accent-[#FF5A36]"
                          />
                          <span>{meal}</span>
                        </label>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <label className="font-bold text-[var(--text-primary)]">Menu Description</label>
                      <Input
                        value={formData.mealDescription}
                        onChange={(e) => setFormData({ ...formData, mealDescription: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 7: House Rules & Policies */}
          {step === 7 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#FF5A36]" /> Step 7: House Rules & Resident Policies
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Gate Curfew Time</label>
                  <Input
                    value={formData.curfewTime}
                    onChange={(e) => setFormData({ ...formData, curfewTime: e.target.value })}
                    placeholder="e.g. 10:30 PM"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Visitor Guidelines</label>
                  <Input
                    value={formData.visitorPolicy}
                    onChange={(e) => setFormData({ ...formData, visitorPolicy: e.target.value })}
                    placeholder="e.g. Allowed in common lobby until 8 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Minimum Lock-in Duration (Months)</label>
                  <Input
                    type="number"
                    value={formData.minimumStayMonths}
                    onChange={(e) => setFormData({ ...formData, minimumStayMonths: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Move-out Notice Period (Days)</label>
                  <Input
                    type="number"
                    value={formData.noticePeriodDays}
                    onChange={(e) => setFormData({ ...formData, noticePeriodDays: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Renter-Facing Listing Preview */}
          {step === 8 && (
            <div className="space-y-5">
              <h2 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
                <Eye className="h-5 w-5 text-[#FF5A36]" /> Step 8: Renter-Facing Listing Preview
              </h2>

              <Card className="p-6 rounded-3xl bg-[var(--surface-hover)] border border-[var(--surface-border)] space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--surface-border)] pb-3">
                  <div>
                    <h3 className="font-bold text-xl text-[var(--text-primary)]">{formData.title || "Untitled Property"}</h3>
                    <div className="text-xs text-[var(--text-muted)]">{formData.locality}, {formData.city} • {formData.type}</div>
                  </div>
                  <Badge variant="emerald" size="sm">PREVIEW</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong>Configured Rooms:</strong> {formData.roomTypes.length} Room Types
                  </div>
                  <div>
                    <strong>Food Plan:</strong> {formData.mealsIncluded ? "Meals Included" : "Self Cooking"}
                  </div>
                  <div>
                    <strong>Gate Curfew:</strong> {formData.curfewTime}
                  </div>
                  <div>
                    <strong>Lock-in Period:</strong> {formData.minimumStayMonths} Months
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 9: Submit for Verification */}
          {step === 9 && (
            <div className="space-y-5 text-center py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto">
                <Sparkles className="h-8 w-8 text-emerald-500" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h2 className="font-bold text-2xl text-[var(--text-primary)]">Publish Listing to Marketplace</h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your accommodation listing will be published directly to the FindYourPeace marketplace for prospective renters to discover and submit booking requests.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-[var(--surface-border)]">
            <Button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              variant="outline"
              size="md"
              className="rounded-xl text-xs font-semibold"
            >
              Previous Step
            </Button>

            {step < 9 ? (
              <Button
                type="button"
                onClick={nextStep}
                variant="primary"
                size="md"
                className="bg-[#FF5A36] hover:bg-[#E0482B] text-white rounded-xl text-xs font-semibold gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmitProperty}
                disabled={isSubmitting}
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Publish Property Listing</span>
              </Button>
            )}
          </div>
        </Card>

        {/* FindYourPeace Submission Confirmation Dialog */}
        {submissionSuccessModal && (
          <Dialog open={submissionSuccessModal} onOpenChange={setSubmissionSuccessModal}>
            <DialogContent className="max-w-md text-center space-y-4">
              <DialogHeader>
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-display font-extrabold text-[var(--text-primary)]">
                  Property Published Successfully
                </DialogTitle>
                <DialogDescription className="text-xs text-[var(--text-secondary)]">
                  Your property listing is live on the FindYourPeace marketplace. You can view booking requests inside your Host Partner Hub.
                </DialogDescription>
              </DialogHeader>

              <Button
                onClick={() => {
                  setSubmissionSuccessModal(false);
                  router.push("/owner/properties");
                }}
                variant="primary"
                size="md"
                className="w-full bg-[#FF5A36] text-white font-bold rounded-2xl h-11"
              >
                Go to My Host Properties
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </OwnerShell>
  );
}
