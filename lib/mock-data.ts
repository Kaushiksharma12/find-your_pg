export interface RoomType {
  id: string;
  name: string; // e.g. "Single Occupancy", "Double Sharing", "Triple Sharing"
  price: number;
  deposit: number;
  occupancy: string;
  availableCount: number;
  amenities: string[];
  image: string;
}

export interface PropertyReview {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  ownerReply?: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  type: "Boys PG" | "Girls PG" | "Co-living" | "Luxury Studio" | "Apartment";
  verified: boolean;
  featured: boolean;
  city: string;
  locality: string;
  address: string;
  distanceFromCollege: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  preferredFor: "Anyone" | "Male" | "Female";
  amenities: string[];
  foodProvided: boolean;
  foodType?: string;
  securityFeatures: string[];
  houseRules: string[];
  nearbyLandmarks: string[];
  rooms: RoomType[];
  reviews: PropertyReview[];
  host: {
    name: string;
    avatar: string;
    phone: string;
    responseRate: string;
    verifiedHost: boolean;
  };
}

export interface CityData {
  id: string;
  name: string;
  state: string;
  propertyCount: number;
  startingPrice: number;
  image: string;
  popularLocalities: string[];
}

export const CITIES_DATA: CityData[] = [
  {
    id: "bangalore",
    name: "Bangalore",
    state: "Karnataka",
    propertyCount: 1540,
    startingPrice: 7500,
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    popularLocalities: ["Koramangala", "Indiranagar", "HSR Layout", "Electronic City", "JP Nagar"],
  },
  {
    id: "pune",
    name: "Pune",
    state: "Maharashtra",
    propertyCount: 890,
    startingPrice: 6500,
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80",
    popularLocalities: ["Kothrud", "Viman Nagar", "Baner", "Hinjewadi", "Aundh"],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    propertyCount: 720,
    startingPrice: 7000,
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80",
    popularLocalities: ["Gachibowli", "HITECH City", "Madhapur", "Kukatpally", "Banjara Hills"],
  },
  {
    id: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    propertyCount: 680,
    startingPrice: 6800,
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    popularLocalities: ["Velachery", "Adyar", "OMR", "T. Nagar", "Anna Nagar"],
  },
  {
    id: "delhi",
    name: "Delhi NCR",
    state: "Delhi",
    propertyCount: 1280,
    startingPrice: 8000,
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80",
    popularLocalities: ["North Campus", "South Campus", "Gurugram Sec 44", "Noida Sec 62"],
  },
  {
    id: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    propertyCount: 950,
    startingPrice: 11000,
    image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80",
    popularLocalities: ["Andheri West", "Bandra", "Powai", "Vile Parle", "Thane"],
  },
];

export const PROPERTIES_DATA: Property[] = [
  {
    id: "sunrise-pg",
    title: "Sunrise PG & Student Living",
    slug: "sunrise-pg-koramangala",
    type: "Co-living",
    verified: true,
    featured: true,
    city: "Bangalore",
    locality: "Koramangala",
    address: "45, 5th Block, 8th Main, Koramangala, Bangalore",
    distanceFromCollege: "1.2 km from Christ University",
    startingPrice: 8500,
    rating: 4.5,
    reviewCount: 120,
    images: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Modern student living space equipped with ergonomic workstations, high-speed Wi-Fi 6, wholesome 3-time meals, daily room cleaning, 24/7 power backup, biometric security entry, and vibrant rooftop community space.",
    preferredFor: "Anyone",
    amenities: ["Wi-Fi 6", "3-Time Meals", "Air Conditioning", "Daily Housekeeping", "Power Backup", "Gym Access", "Washing Machines", "Biometric Access"],
    foodProvided: true,
    foodType: "North & South Indian Veg/Non-Veg",
    securityFeatures: ["24/7 CCTV Surveillance", "Biometric Door Entry", "On-site Warden"],
    houseRules: ["No Smoking inside rooms", "Visitors allowed in common areas till 9 PM", "Quiet hours after 11 PM"],
    nearbyLandmarks: ["Christ University (1.2 km)", "Forum Mall (800m)", "Koramangala Metro (1.5 km)"],
    rooms: [
      {
        id: "room-s1",
        name: "Single Deluxe Room",
        price: 13500,
        deposit: 13500,
        occupancy: "Single",
        availableCount: 3,
        amenities: ["Attached Bathroom", "Split AC", "Work Desk", "Balcony"],
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "room-d2",
        name: "Double Sharing Room",
        price: 8500,
        deposit: 8500,
        occupancy: "2 Sharing",
        availableCount: 5,
        amenities: ["Attached Bathroom", "Air Conditioning", "Individual Wardrobe"],
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "room-t3",
        name: "Triple Sharing Economy",
        price: 7000,
        deposit: 7000,
        occupancy: "3 Sharing",
        availableCount: 2,
        amenities: ["Attached Bathroom", "High Speed Wi-Fi", "Dedicated Locker"],
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        userName: "Aarav Sharma",
        userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "2 weeks ago",
        comment: "Awesome food quality and super fast Wi-Fi! Perfect location for Christ Uni students. The warden is very helpful.",
        ownerReply: "Thank you Aarav! Glad you're enjoying your stay with us.",
      },
      {
        id: "rev-2",
        userName: "Priya Nair",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        rating: 4,
        date: "1 month ago",
        comment: "Clean rooms and good security. The rooftop lounge is great for studying or relaxing after college.",
      },
    ],
    host: {
      name: "Ramesh Kumar",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      phone: "+91 98765 43210",
      responseRate: "98% (Responds in 15 mins)",
      verifiedHost: true,
    },
  },
  {
    id: "green-living",
    title: "Green Living Student Residency",
    slug: "green-living-indiranagar",
    type: "Girls PG",
    verified: true,
    featured: true,
    city: "Bangalore",
    locality: "Indiranagar",
    address: "12, 100 Feet Road, Indiranagar, Bangalore",
    distanceFromCollege: "2.4 km from IPC",
    startingPrice: 9500,
    rating: 4.8,
    reviewCount: 95,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Premium eco-friendly residence for women featuring solar-powered energy, organic meal options, security guard on 24/7 duty, aesthetic common areas, and high speed fibre internet.",
    preferredFor: "Female",
    amenities: ["Wi-Fi 6", "Meals Included", "Air Conditioning", "Housekeeping", "Security Guard", "Laundry"],
    foodProvided: true,
    foodType: "Hygienic Home-cooked Veg",
    securityFeatures: ["Female Warden", "24/7 Guard Duty", "CCTV"],
    houseRules: ["Curfew at 10:30 PM", "No male guests in rooms"],
    nearbyLandmarks: ["Indiranagar Metro Station (500m)", "100 Feet Road Food Hub"],
    rooms: [
      {
        id: "room-g1",
        name: "Single Private Room",
        price: 14500,
        deposit: 14500,
        occupancy: "Single",
        availableCount: 2,
        amenities: ["Attached Bathroom", "AC", "Private Desk"],
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "room-g2",
        name: "Twin Sharing Room",
        price: 9500,
        deposit: 9500,
        occupancy: "2 Sharing",
        availableCount: 4,
        amenities: ["Attached Bath", "Individual Almirah"],
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      },
    ],
    reviews: [
      {
        id: "rev-g1",
        userName: "Ananya Roy",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        rating: 5,
        date: "3 weeks ago",
        comment: "Felt super safe from day one! Home-like food and lovely clean environment.",
      },
    ],
    host: {
      name: "Sunita Deshmukh",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      phone: "+91 98111 22334",
      responseRate: "100% (Instant response)",
      verifiedHost: true,
    },
  },
  {
    id: "urban-nest",
    title: "Urban Nest Co-Living Pods",
    slug: "urban-nest-marathahalli",
    type: "Co-living",
    verified: true,
    featured: true,
    city: "Bangalore",
    locality: "Marathahalli",
    address: "88, Outer Ring Road, Marathahalli, Bangalore",
    distanceFromCollege: "2.8 km from New Horizon College",
    startingPrice: 7500,
    rating: 4.6,
    reviewCount: 88,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Smart co-living spaces for tech professionals and students with gaming lounge, high speed wifi, cafeteria, gym, and flexible monthly rental agreements.",
    preferredFor: "Anyone",
    amenities: ["Wi-Fi 6", "Gym Access", "Meals", "Power Backup", "Gaming Zone", "Biometric Lock"],
    foodProvided: true,
    foodType: "Buffet Veg/Non-Veg",
    securityFeatures: ["24/7 Security", "CCTV", "RFID Access"],
    houseRules: ["No loud noise past midnight"],
    nearbyLandmarks: ["Marathahalli Bridge (400m)", "Tech Parks (1.5 km)"],
    rooms: [
      {
        id: "room-u1",
        name: "Shared Twin Pod",
        price: 7500,
        deposit: 7500,
        occupancy: "2 Sharing",
        availableCount: 6,
        amenities: ["Wi-Fi", "Locker", "Study Light"],
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      },
    ],
    reviews: [],
    host: {
      name: "Vikram Malhotra",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      phone: "+91 99887 76655",
      responseRate: "95%",
      verifiedHost: true,
    },
  },
  {
    id: "aura-heights",
    title: "Aura Spatial Heights",
    slug: "aura-spatial-heights-pune",
    type: "Boys PG",
    verified: true,
    featured: true,
    city: "Pune",
    locality: "Kothrud",
    address: "24, Paud Road, Kothrud, Pune",
    distanceFromCollege: "800m from MIT-WPU",
    startingPrice: 8000,
    rating: 4.9,
    reviewCount: 142,
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Top-rated student housing near MIT-WPU. Features study pods, high speed Wi-Fi, food mess, daily laundry, and dedicated library space.",
    preferredFor: "Male",
    amenities: ["Wi-Fi 6", "Study Pods", "Housekeeping", "Power Backup", "Meals Included", "Laundry"],
    foodProvided: true,
    foodType: "Maharashtrian & North Indian Meals",
    securityFeatures: ["Biometric Entry", "Night Warden"],
    houseRules: ["No alcohol or smoking"],
    nearbyLandmarks: ["MIT-WPU Campus (800m)", "Ideal Colony Metro (300m)"],
    rooms: [
      {
        id: "room-a1",
        name: "Single Study Studio",
        price: 13000,
        deposit: 13000,
        occupancy: "Single",
        availableCount: 1,
        amenities: ["Attached Bath", "AC", "Study Desk"],
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: "room-a2",
        name: "Double Sharing Deluxe",
        price: 8000,
        deposit: 8000,
        occupancy: "2 Sharing",
        availableCount: 3,
        amenities: ["Attached Bath", "Study Table"],
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    reviews: [],
    host: {
      name: "Sanjay Kulkarni",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      phone: "+91 97654 32109",
      responseRate: "99%",
      verifiedHost: true,
    },
  },
  {
    id: "celestial-villa",
    title: "Celestial Eco Villa",
    slug: "celestial-eco-villa-baner",
    type: "Luxury Studio",
    verified: true,
    featured: false,
    city: "Pune",
    locality: "Baner",
    address: "10, Baner Hill View Road, Pune",
    distanceFromCollege: "3.5 km from Symbiosis",
    startingPrice: 12500,
    rating: 4.8,
    reviewCount: 64,
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    ],
    description: "Independent luxury studios with kitchenette, private balcony, EV charging station, swimming pool access, and smart keyless door locks.",
    preferredFor: "Anyone",
    amenities: ["Kitchenette", "Private Balcony", "EV Charger", "Gym & Pool", "Wi-Fi 6", "Housekeeping"],
    foodProvided: false,
    securityFeatures: ["Smart Keyless Entry", "24/7 Guard"],
    houseRules: ["Pets allowed with prior approval"],
    nearbyLandmarks: ["Baner High Street (1 km)"],
    rooms: [
      {
        id: "room-c1",
        name: "Private Studio Apartment",
        price: 18000,
        deposit: 18000,
        occupancy: "Single",
        availableCount: 2,
        amenities: ["Kitchenette", "Balcony", "Smart TV", "AC"],
        image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      },
    ],
    reviews: [],
    host: {
      name: "Neha Joshi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      phone: "+91 98222 11000",
      responseRate: "97%",
      verifiedHost: true,
    },
  },
  {
    id: "amber-stays",
    title: "Amber Stays Student Hostel",
    slug: "amber-stays-jp-nagar",
    type: "Boys PG",
    verified: true,
    featured: false,
    city: "Bangalore",
    locality: "JP Nagar",
    address: "15, 3rd Phase, JP Nagar, Bangalore",
    distanceFromCollege: "1.8 km from IIM-B",
    startingPrice: 6500,
    rating: 4.3,
    reviewCount: 42,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    description: "Affordable student lodging with high speed wifi, daily clean rooms, hot water 24/7, and laundry service.",
    preferredFor: "Male",
    amenities: ["Wi-Fi 6", "Meals", "Hot Water 24/7", "Washing Machine"],
    foodProvided: true,
    securityFeatures: ["CCTV", "Warden"],
    houseRules: ["No outsiders allowed after 10 PM"],
    nearbyLandmarks: ["Vega City Mall (1 km)"],
    rooms: [
      {
        id: "room-b1",
        name: "Triple Sharing Standard",
        price: 6500,
        deposit: 6500,
        occupancy: "3 Sharing",
        availableCount: 4,
        amenities: ["Shared Bathroom", "Wi-Fi", "Locker"],
        image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      },
    ],
    reviews: [],
    host: {
      name: "Karan Singh",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      phone: "+91 99000 88776",
      responseRate: "90%",
      verifiedHost: true,
    },
  },
];

// USER DASHBOARD MOCK DATA
export const MOCK_USER_PROFILE = {
  name: "Kaushik Sharma",
  email: "kaushik@findyourpeace.com",
  phone: "+91 98765 43210",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  role: "Student / Renter",
  college: "MIT-WPU Pune",
  preferredCity: "Bangalore",
  budgetMax: 15000,
  stats: {
    enquiries: 3,
    upcomingVisits: 1,
    activeBookings: 1,
    shortlisted: 5,
  },
  activities: [
    { id: "act-1", type: "enquiry", title: "Enquiry sent to Sunrise PG", time: "2 hours ago", status: "Pending", statusVariant: "warning" },
    { id: "act-2", type: "visit", title: "Site visit confirmed - Green Living", time: "1 day ago", status: "Approved", statusVariant: "success" },
    { id: "act-3", type: "booking", title: "Booking request sent - Urban Nest", time: "3 days ago", status: "Pending", statusVariant: "warning" },
    { id: "act-4", type: "review", title: "Reviewed Aura Spatial Heights", time: "1 week ago", status: "Published", statusVariant: "info" },
  ],
  enquiries: [
    { id: "enq-101", propertyName: "Sunrise PG", location: "Koramangala, Bangalore", date: "Oct 5, 2026", message: "Is single occupancy available from Nov 1?", status: "Replied by Host", hostResponse: "Yes Kaushik, single room is ready. Feel free to schedule a visit!" },
    { id: "enq-102", propertyName: "Aura Spatial Heights", location: "Kothrud, Pune", date: "Sep 28, 2026", message: "Does the rent include 3-time meals?", status: "Resolved", hostResponse: "Yes, 3-time wholesome meals and evening snacks are included." },
  ],
  visits: [
    { id: "vis-201", propertyName: "Green Living", location: "Indiranagar, Bangalore", scheduledDate: "Oct 10, 2026 at 4:00 PM", status: "Confirmed", contactPerson: "Sunita Deshmukh (+91 98111 22334)" },
  ],
  bookings: [
    { id: "bk-301", propertyName: "Sunrise PG", roomName: "Double Sharing Room", checkInDate: "Oct 15, 2026", rent: "₹8,500/month", deposit: "₹8,500", status: "Active / Confirmed", code: "SN-BK-8921" },
  ],
};

// OWNER DASHBOARD MOCK DATA
export const MOCK_OWNER_DATA = {
  name: "Ramesh Kumar",
  email: "ramesh.host@findyourpeace.com",
  phone: "+91 98765 43210",
  verified: true,
  stats: {
    totalProperties: 3,
    activeRooms: 12,
    occupancyRate: "91%",
    pendingEnquiries: 4,
    monthlyRevenue: "₹1,42,000",
  },
  properties: [
    { id: "sunrise-pg", title: "Sunrise PG & Student Living", city: "Bangalore", locality: "Koramangala", totalRooms: 8, occupiedRooms: 7, status: "Published" },
    { id: "amber-stays", title: "Amber Stays Student Hostel", city: "Bangalore", locality: "JP Nagar", totalRooms: 4, occupiedRooms: 4, status: "Published" },
  ],
  incomingEnquiries: [
    { id: "ie-1", senderName: "Kaushik Sharma", property: "Sunrise PG", date: "Oct 6, 2026", question: "Is single occupancy available from Nov 1?", status: "Pending Response" },
    { id: "ie-2", senderName: "Rohan Varma", property: "Sunrise PG", date: "Oct 5, 2026", question: "What is the security deposit refund policy?", status: "Answered" },
  ],
  visitRequests: [
    { id: "vr-1", visitorName: "Priya Nair", property: "Sunrise PG", requestedTime: "Oct 8, 2026 at 5:00 PM", status: "Pending Confirmation" },
  ],
  bookingRequests: [
    { id: "br-1", applicantName: "Anik Roy", property: "Sunrise PG", roomType: "Double Sharing", checkIn: "Nov 1, 2026", status: "Pending Review" },
  ],
};

// ADMIN DASHBOARD MOCK DATA
export const MOCK_ADMIN_DATA = {
  stats: {
    totalUsers: 14280,
    totalOwners: 1240,
    totalProperties: 3450,
    pendingVerifications: 14,
    monthlyBookings: 890,
  },
  verificationQueue: [
    { id: "prop-req-1", title: "Zenith Co-Living Pods", ownerName: "Vikram Malhotra", city: "Pune", locality: "Viman Nagar", submittedDate: "Oct 6, 2026", roomsCount: 15, status: "Pending Verification" },
    { id: "prop-req-2", title: "Serene Residency for Girls", ownerName: "Meena Patel", city: "Bangalore", locality: "HSR Layout", submittedDate: "Oct 5, 2026", roomsCount: 10, status: "Under Review" },
  ],
  usersList: [
    { id: "u-1", name: "Kaushik Sharma", email: "kaushik@findyourpeace.com", role: "Renter", status: "Active", joined: "Jan 2026" },
    { id: "u-2", name: "Ramesh Kumar", email: "ramesh.host@findyourpeace.com", role: "Host Partner", status: "Verified", joined: "Mar 2025" },
    { id: "u-3", name: "Sunita Deshmukh", email: "sunita@findyourpeace.com", role: "Host Partner", status: "Verified", joined: "Nov 2025" },
  ],
  auditLogs: [
    { id: "log-1", action: "Property Verification Approved", target: "Aura Spatial Heights", details: "Issued Emerald Verified Badge", performedBy: "Admin #1 (System)", timestamp: "Oct 6, 2026, 10:14 AM" },
    { id: "log-2", action: "New Host Partner Verified", target: "Neha Joshi", details: "Identity KYC confirmed", performedBy: "Admin #2", timestamp: "Oct 5, 2026, 04:30 PM" },
  ],
};

export const MOCK_ADMIN_AUDIT_LOGS = MOCK_ADMIN_DATA.auditLogs;


