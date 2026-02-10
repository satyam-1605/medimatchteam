import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Users,
  Zap,
  LocateFixed,
  Map,
  List,
  Navigation,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import DoctorCard from "@/components/doctors/DoctorCard";
import DoctorMap from "@/components/doctors/DoctorMap";

const specialties = [
  "All Specialties",
  "Rheumatologist",
  "Cardiologist",
  "Neurologist",
  "Pulmonologist",
  "Sports Medicine",
  "Orthopedic",
  "Gastroenterologist",
  "Dermatologist",
  "Ophthalmologist",
  "ENT (Otolaryngologist)",
  "Allergist / Immunologist",
  "Psychiatrist",
  "Sleep Specialist",
  "Physiatrist (PM&R)",
  "Infectious Disease",
  "Urologist",
  "Endocrinologist",
  "Pain Management",
  "General Physician",
];

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  distance: string;
  address: string;
  availability: "available" | "busy" | "offline";
  nextSlot: string;
  image: string;
  experience: string;
  languages: string[];
  videoCallAvailable: boolean;
  lat: number;
  lng: number;
};

// Doctors with coordinates scattered around NYC
const mockDoctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Chen", specialty: "Neurologist", rating: 4.9, reviews: 127, distance: "0.8 mi", address: "123 Medical Center Dr, Suite 400", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "15 years", languages: ["English", "Mandarin"], videoCallAvailable: true, lat: 40.7580, lng: -73.9855 },
  { id: 2, name: "Dr. Emily Thompson", specialty: "Neurologist", rating: 4.7, reviews: 89, distance: "2.1 mi", address: "789 Brain & Spine Center", availability: "available", nextSlot: "Today, 5:30 PM", image: "", experience: "12 years", languages: ["English"], videoCallAvailable: true, lat: 40.7484, lng: -73.9857 },
  { id: 3, name: "Dr. Michael Roberts", specialty: "Cardiologist", rating: 4.8, reviews: 203, distance: "1.2 mi", address: "456 Heart Health Blvd", availability: "busy", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "20 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7549, lng: -73.9840 },
  { id: 4, name: "Dr. Anita Sharma", specialty: "Cardiologist", rating: 4.9, reviews: 156, distance: "1.5 mi", address: "200 Cardiac Care Plaza", availability: "available", nextSlot: "Today, 2:00 PM", image: "", experience: "18 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 40.7614, lng: -73.9776 },
  { id: 5, name: "Dr. Lisa Park", specialty: "Dermatologist", rating: 4.9, reviews: 156, distance: "1.8 mi", address: "555 Skin Care Center", availability: "busy", nextSlot: "Friday, 11:00 AM", image: "", experience: "10 years", languages: ["English", "Korean"], videoCallAvailable: true, lat: 40.7282, lng: -73.7949 },
  { id: 6, name: "Dr. David Kim", specialty: "Dermatologist", rating: 4.6, reviews: 98, distance: "2.4 mi", address: "777 Dermatology Associates", availability: "available", nextSlot: "Tomorrow, 9:00 AM", image: "", experience: "8 years", languages: ["English"], videoCallAvailable: true, lat: 40.7589, lng: -73.9851 },
  { id: 7, name: "Dr. Robert Martinez", specialty: "Orthopedic", rating: 4.8, reviews: 178, distance: "3.2 mi", address: "888 Joint & Bone Specialists", availability: "offline", nextSlot: "Next Monday", image: "", experience: "22 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7061, lng: -74.0089 },
  { id: 8, name: "Dr. Jennifer Walsh", specialty: "Orthopedic", rating: 4.7, reviews: 134, distance: "1.0 mi", address: "100 Ortho & Sports Clinic", availability: "available", nextSlot: "Today, 4:00 PM", image: "", experience: "14 years", languages: ["English", "French"], videoCallAvailable: true, lat: 40.7527, lng: -73.9772 },
  { id: 9, name: "Dr. James Wilson", specialty: "General Physician", rating: 4.6, reviews: 312, distance: "0.5 mi", address: "321 Family Health Clinic", availability: "available", nextSlot: "Today, 4:15 PM", image: "", experience: "18 years", languages: ["English", "French"], videoCallAvailable: true, lat: 40.7488, lng: -73.9680 },
  { id: 10, name: "Dr. Maria Santos", specialty: "General Physician", rating: 4.8, reviews: 245, distance: "0.9 mi", address: "450 Primary Care Center", availability: "available", nextSlot: "Today, 6:00 PM", image: "", experience: "16 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7433, lng: -73.9916 },
  { id: 11, name: "Dr. Rachel Green", specialty: "Psychiatrist", rating: 4.9, reviews: 189, distance: "1.3 mi", address: "600 Mind Wellness Institute", availability: "busy", nextSlot: "Tomorrow, 11:00 AM", image: "", experience: "12 years", languages: ["English"], videoCallAvailable: true, lat: 40.7831, lng: -73.9712 },
  { id: 12, name: "Dr. Kevin Patel", specialty: "Psychiatrist", rating: 4.7, reviews: 112, distance: "2.0 mi", address: "301 Behavioral Health Center", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "9 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 40.7265, lng: -73.9898 },
  { id: 13, name: "Dr. Helen Brooks", specialty: "Rheumatologist", rating: 4.8, reviews: 167, distance: "1.7 mi", address: "222 Arthritis & Joint Care", availability: "available", nextSlot: "Tomorrow, 2:30 PM", image: "", experience: "19 years", languages: ["English"], videoCallAvailable: true, lat: 40.7678, lng: -73.9645 },
  { id: 14, name: "Dr. Thomas Reed", specialty: "Rheumatologist", rating: 4.6, reviews: 94, distance: "2.8 mi", address: "333 Rheumatology Center", availability: "offline", nextSlot: "Next Tuesday", image: "", experience: "11 years", languages: ["English", "German"], videoCallAvailable: true, lat: 40.6892, lng: -74.0445 },
  { id: 15, name: "Dr. Amy Foster", specialty: "Pulmonologist", rating: 4.9, reviews: 201, distance: "1.1 mi", address: "444 Lung & Breathing Institute", availability: "available", nextSlot: "Today, 3:30 PM", image: "", experience: "17 years", languages: ["English"], videoCallAvailable: true, lat: 40.7527, lng: -73.9553 },
  { id: 16, name: "Dr. Mark Hughes", specialty: "Pulmonologist", rating: 4.7, reviews: 88, distance: "2.5 mi", address: "555 Respiratory Care", availability: "busy", nextSlot: "Friday, 10:00 AM", image: "", experience: "13 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7357, lng: -74.0014 },
  { id: 17, name: "Dr. Nina Kowalski", specialty: "Sports Medicine", rating: 4.8, reviews: 145, distance: "0.7 mi", address: "666 Sports Med & Rehab", availability: "available", nextSlot: "Today, 1:00 PM", image: "", experience: "10 years", languages: ["English", "Polish"], videoCallAvailable: true, lat: 40.7505, lng: -73.9934 },
  { id: 18, name: "Dr. Chris Taylor", specialty: "Sports Medicine", rating: 4.7, reviews: 76, distance: "1.9 mi", address: "777 Athletic Health Clinic", availability: "available", nextSlot: "Tomorrow, 4:00 PM", image: "", experience: "8 years", languages: ["English"], videoCallAvailable: true, lat: 40.7190, lng: -73.9973 },
  { id: 19, name: "Dr. Susan Lee", specialty: "Gastroenterologist", rating: 4.9, reviews: 198, distance: "1.4 mi", address: "888 Digestive Health Center", availability: "busy", nextSlot: "Tomorrow, 9:30 AM", image: "", experience: "21 years", languages: ["English", "Mandarin"], videoCallAvailable: true, lat: 40.7736, lng: -73.9566 },
  { id: 20, name: "Dr. Paul Nguyen", specialty: "Gastroenterologist", rating: 4.6, reviews: 102, distance: "2.2 mi", address: "999 GI Associates", availability: "available", nextSlot: "Today, 5:45 PM", image: "", experience: "7 years", languages: ["English", "Vietnamese"], videoCallAvailable: true, lat: 40.7158, lng: -73.9970 },
  { id: 21, name: "Dr. Olivia Brown", specialty: "Ophthalmologist", rating: 4.8, reviews: 176, distance: "0.6 mi", address: "111 Vision Care Plaza", availability: "available", nextSlot: "Today, 2:15 PM", image: "", experience: "15 years", languages: ["English"], videoCallAvailable: true, lat: 40.7468, lng: -73.9867 },
  { id: 22, name: "Dr. Daniel Clark", specialty: "Ophthalmologist", rating: 4.7, reviews: 119, distance: "1.6 mi", address: "222 Eye Institute", availability: "offline", nextSlot: "Next Wednesday", image: "", experience: "11 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.6782, lng: -73.9442 },
  { id: 23, name: "Dr. Fiona O'Brien", specialty: "ENT (Otolaryngologist)", rating: 4.9, reviews: 134, distance: "1.2 mi", address: "333 Ear Nose Throat Center", availability: "available", nextSlot: "Today, 4:30 PM", image: "", experience: "14 years", languages: ["English", "Irish"], videoCallAvailable: true, lat: 40.7614, lng: -73.9550 },
  { id: 24, name: "Dr. Alex Rivera", specialty: "ENT (Otolaryngologist)", rating: 4.6, reviews: 87, distance: "2.0 mi", address: "444 ENT Specialists", availability: "available", nextSlot: "Tomorrow, 11:30 AM", image: "", experience: "9 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7308, lng: -73.9973 },
  { id: 25, name: "Dr. Emma Watson", specialty: "Allergist / Immunologist", rating: 4.8, reviews: 156, distance: "1.0 mi", address: "555 Allergy & Asthma Center", availability: "busy", nextSlot: "Friday, 9:00 AM", image: "", experience: "12 years", languages: ["English"], videoCallAvailable: true, lat: 40.7411, lng: -73.9897 },
  { id: 26, name: "Dr. Ryan Mitchell", specialty: "Allergist / Immunologist", rating: 4.7, reviews: 92, distance: "2.3 mi", address: "666 Immunology Associates", availability: "available", nextSlot: "Today, 6:30 PM", image: "", experience: "8 years", languages: ["English"], videoCallAvailable: true, lat: 40.7648, lng: -73.9808 },
  { id: 27, name: "Dr. Sophie Martin", specialty: "Sleep Specialist", rating: 4.9, reviews: 143, distance: "1.5 mi", address: "777 Sleep Disorders Center", availability: "available", nextSlot: "Tomorrow, 3:00 PM", image: "", experience: "16 years", languages: ["English", "French"], videoCallAvailable: true, lat: 40.7794, lng: -73.9632 },
  { id: 28, name: "Dr. James Liu", specialty: "Sleep Specialist", rating: 4.6, reviews: 78, distance: "2.6 mi", address: "888 Sleep Health Clinic", availability: "offline", nextSlot: "Next Thursday", image: "", experience: "10 years", languages: ["English", "Mandarin"], videoCallAvailable: true, lat: 40.6943, lng: -73.9865 },
  { id: 29, name: "Dr. Laura Bennett", specialty: "Physiatrist (PM&R)", rating: 4.8, reviews: 167, distance: "0.8 mi", address: "999 Rehab & PM&R Center", availability: "available", nextSlot: "Today, 1:30 PM", image: "", experience: "14 years", languages: ["English"], videoCallAvailable: true, lat: 40.7455, lng: -73.9782 },
  { id: 30, name: "Dr. Eric Johnson", specialty: "Physiatrist (PM&R)", rating: 4.7, reviews: 95, distance: "1.8 mi", address: "100 Physical Medicine Associates", availability: "busy", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "11 years", languages: ["English", "Swedish"], videoCallAvailable: true, lat: 40.7380, lng: -73.9819 },
  { id: 31, name: "Dr. Priya Nair", specialty: "Infectious Disease", rating: 4.9, reviews: 112, distance: "2.1 mi", address: "200 ID & Travel Medicine", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "18 years", languages: ["English", "Hindi", "Tamil"], videoCallAvailable: true, lat: 40.7580, lng: -73.9654 },
  { id: 32, name: "Dr. William Davis", specialty: "Infectious Disease", rating: 4.7, reviews: 84, distance: "0.9 mi", address: "300 Infection Control Center", availability: "offline", nextSlot: "Next Monday", image: "", experience: "13 years", languages: ["English"], videoCallAvailable: true, lat: 40.7128, lng: -74.0060 },
  { id: 33, name: "Dr. Catherine Moore", specialty: "Urologist", rating: 4.8, reviews: 189, distance: "1.3 mi", address: "400 Urology Center", availability: "available", nextSlot: "Tomorrow, 2:00 PM", image: "", experience: "20 years", languages: ["English"], videoCallAvailable: true, lat: 40.7549, lng: -73.9720 },
  { id: 34, name: "Dr. Andrew Scott", specialty: "Urologist", rating: 4.6, reviews: 106, distance: "2.4 mi", address: "500 Urology Associates", availability: "busy", nextSlot: "Friday, 11:00 AM", image: "", experience: "9 years", languages: ["English", "Scottish"], videoCallAvailable: true, lat: 40.7614, lng: -73.9490 },
  { id: 35, name: "Dr. Michelle Adams", specialty: "Endocrinologist", rating: 4.9, reviews: 178, distance: "1.1 mi", address: "600 Diabetes & Hormone Center", availability: "available", nextSlot: "Today, 4:00 PM", image: "", experience: "17 years", languages: ["English"], videoCallAvailable: true, lat: 40.7484, lng: -73.9715 },
  { id: 36, name: "Dr. Brian Cooper", specialty: "Endocrinologist", rating: 4.7, reviews: 91, distance: "1.9 mi", address: "700 Endocrinology Institute", availability: "offline", nextSlot: "Next Tuesday", image: "", experience: "12 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7220, lng: -73.9876 },
  { id: 37, name: "Dr. Nancy Phillips", specialty: "Pain Management", rating: 4.8, reviews: 198, distance: "0.5 mi", address: "800 Pain Relief Center", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "22 years", languages: ["English"], videoCallAvailable: true, lat: 40.7505, lng: -73.9878 },
  { id: 38, name: "Dr. Steven Turner", specialty: "Pain Management", rating: 4.6, reviews: 124, distance: "2.0 mi", address: "900 Chronic Pain Clinic", availability: "busy", nextSlot: "Tomorrow, 1:00 PM", image: "", experience: "15 years", languages: ["English"], videoCallAvailable: true, lat: 40.7350, lng: -73.9920 },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const DoctorDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [locationName, setLocationName] = useState("Detecting location...");
  const [maxDistance, setMaxDistance] = useState<number>(10); // miles
  const pillsRef = useRef<HTMLDivElement>(null);

  const scrollPills = (dir: "left" | "right") => {
    pillsRef.current?.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      setLocationName("Geolocation not supported");
      return;
    }
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setLocationStatus("granted");
        setLocationName(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            if (data.address) {
              const parts = [data.address.suburb || data.address.neighbourhood, data.address.city || data.address.town, data.address.state].filter(Boolean);
              setLocationName(parts.join(", ") || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
            }
          })
          .catch(() => {});
      },
      () => {
        setLocationStatus("denied");
        setLocationName("Location access denied");
        // Fallback to NYC
        setUserLocation({ lat: 40.7128, lng: -74.006 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  // Compute real distances if location is available
  const doctorsWithDistance = mockDoctors.map((doc) => {
    if (userLocation) {
      const dist = haversineDistance(userLocation.lat, userLocation.lng, doc.lat, doc.lng);
      return { ...doc, distance: `${dist.toFixed(1)} mi`, _distanceNum: dist };
    }
    return { ...doc, _distanceNum: parseFloat(doc.distance) };
  });

  const filteredDoctors = doctorsWithDistance.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      doctor.specialty === selectedSpecialty;
    const matchesDistance = doctor._distanceNum <= maxDistance;
    return matchesSearch && matchesSpecialty && matchesDistance;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "distance") return a._distanceNum - b._distanceNum;
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  const availableCount = mockDoctors.filter((d) => d.availability === "available").length;

  const mapDoctors = sortedDoctors.map((d) => ({
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    lat: d.lat,
    lng: d.lng,
    availability: d.availability,
    rating: d.rating,
    nextSlot: d.nextSlot,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />

      <main className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Hero header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
              <Zap className="w-3.5 h-3.5" />
              AI-Matched Specialists Near You
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">
              <span className="headline-gradient">Find Your Doctor</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-base">
              Browse our verified network of healthcare professionals — book instantly or start a video call.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 mt-6">
              {[
                { icon: Users, label: "Specialists", value: mockDoctors.length },
                { icon: Stethoscope, label: "Specialties", value: specialties.length - 1 },
                { icon: Zap, label: "Available Now", value: availableCount },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-lg font-bold text-foreground leading-none">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Location bar */}
          <motion.div
            className="glass-panel p-4 mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Current location */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  locationStatus === "granted"
                    ? "bg-success/15 border border-success/30"
                    : locationStatus === "loading"
                    ? "bg-primary/15 border border-primary/30 animate-pulse"
                    : "bg-muted border border-border"
                }`}>
                  <Navigation className={`w-5 h-5 ${
                    locationStatus === "granted" ? "text-success" : locationStatus === "loading" ? "text-primary" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Your Location</p>
                  <p className="text-sm font-medium text-foreground truncate">{locationName}</p>
                </div>
                {locationStatus !== "loading" && (
                  <button
                    onClick={detectLocation}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex-shrink-0"
                  >
                    <LocateFixed className="w-3.5 h-3.5" />
                    {locationStatus === "granted" ? "Update" : "Detect"}
                  </button>
                )}
              </div>

              {/* Distance radius */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Radius:</span>
                <div className="flex gap-1">
                  {[2, 5, 10, 25, 50].map((d) => (
                    <button
                      key={d}
                      onClick={() => setMaxDistance(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        maxDistance === d
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                      }`}
                    >
                      {d} mi
                    </button>
                  ))}
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-muted rounded-xl p-1 flex-shrink-0">
                {[
                  { mode: "list" as const, icon: List, label: "List" },
                  { mode: "split" as const, icon: Map, label: "Split" },
                  { mode: "map" as const, icon: MapPin, label: "Map" },
                ].map(({ mode, icon: Icon, label }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === mode
                        ? "bg-primary/20 text-primary shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Search bar */}
          <motion.div
            className="max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, specialty, or condition..."
                className="w-full pl-14 pr-5 py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
          </motion.div>

          {/* Specialty pills */}
          <motion.div
            className="relative mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <button
              onClick={() => scrollPills("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div
              ref={pillsRef}
              className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialty(spec)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border transition-all duration-200 flex-shrink-0 ${
                    selectedSpecialty === spec
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_12px_hsl(var(--primary)/0.25)]"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
            <button
              onClick={() => scrollPills("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-lg"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Toolbar: count + sort */}
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{sortedDoctors.length}</span> specialist{sortedDoctors.length !== 1 && "s"}
              {selectedSpecialty !== "All Specialties" && (
                <span> in <span className="text-primary font-medium">{selectedSpecialty}</span></span>
              )}
              <span className="text-muted-foreground"> within {maxDistance} mi</span>
            </p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground mr-1">Sort:</span>
              {[
                { value: "rating", icon: Star, label: "Rating" },
                { value: "distance", icon: MapPin, label: "Distance" },
                { value: "reviews", icon: Clock, label: "Reviews" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === option.value
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <option.icon className="w-3 h-3" />
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Main content: list / map / split */}
          <div className={`${viewMode === "split" ? "grid lg:grid-cols-2 gap-6" : ""}`}>
            {/* Doctor list */}
            {viewMode !== "map" && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedSpecialty + sortBy + maxDistance}
                  className={`grid gap-5 ${viewMode === "split" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={viewMode === "split" ? { maxHeight: "70vh", overflowY: "auto", paddingRight: 4 } : {}}
                >
                  {sortedDoctors.map((doctor, index) => (
                    <DoctorCard key={doctor.id} doctor={doctor} index={index} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}

            {/* Map */}
            {viewMode !== "list" && (
              <motion.div
                className="glass-panel overflow-hidden"
                style={{ height: viewMode === "map" ? "70vh" : "70vh" }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <DoctorMap
                  doctors={mapDoctors}
                  userLocation={userLocation}
                />
              </motion.div>
            )}
          </div>

          {/* Empty State */}
          {sortedDoctors.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-muted flex items-center justify-center">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No specialists found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try increasing the radius or changing filters
              </p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedSpecialty("All Specialties"); setMaxDistance(50); }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDirectory;
