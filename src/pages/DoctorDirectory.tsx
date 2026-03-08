import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Shield,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import DoctorCard from "@/components/doctors/DoctorCard";
import BookingDialog from "@/components/doctors/BookingDialog";
import DoctorMap from "@/components/doctors/DoctorMap";
import SchemeDoctorCard, { type SchemeDoctor } from "@/components/doctors/SchemeDoctorCard";
import { supabase } from "@/integrations/supabase/client";

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

// Doctors across NYC and Indian cities (Mumbai, Delhi, Jaipur, Bangalore, Chennai, Kolkata)
const mockDoctors: Doctor[] = [
  // — NYC —
  { id: 1, name: "Dr. Sarah Chen", specialty: "Neurologist", rating: 4.9, reviews: 127, distance: "", address: "123 Medical Center Dr, New York", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "15 years", languages: ["English", "Mandarin"], videoCallAvailable: true, lat: 40.7580, lng: -73.9855 },
  { id: 2, name: "Dr. Emily Thompson", specialty: "Cardiologist", rating: 4.8, reviews: 203, distance: "", address: "456 Heart Health Blvd, New York", availability: "busy", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "20 years", languages: ["English", "Spanish"], videoCallAvailable: true, lat: 40.7549, lng: -73.9840 },
  { id: 3, name: "Dr. James Wilson", specialty: "General Physician", rating: 4.6, reviews: 312, distance: "", address: "321 Family Health Clinic, New York", availability: "available", nextSlot: "Today, 4:15 PM", image: "", experience: "18 years", languages: ["English", "French"], videoCallAvailable: true, lat: 40.7488, lng: -73.9680 },
  { id: 4, name: "Dr. Nancy Phillips", specialty: "Pain Management", rating: 4.8, reviews: 198, distance: "", address: "800 Pain Relief Center, New York", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "22 years", languages: ["English"], videoCallAvailable: true, lat: 40.7505, lng: -73.9878 },
  { id: 5, name: "Dr. Lisa Park", specialty: "Dermatologist", rating: 4.9, reviews: 156, distance: "", address: "555 Skin Care Center, New York", availability: "available", nextSlot: "Friday, 11:00 AM", image: "", experience: "10 years", languages: ["English", "Korean"], videoCallAvailable: true, lat: 40.7282, lng: -73.7949 },

  // — Mumbai —
  { id: 101, name: "Dr. Rajesh Mehta", specialty: "Cardiologist", rating: 4.9, reviews: 342, distance: "", address: "Lilavati Hospital, Bandra West, Mumbai", availability: "available", nextSlot: "Today, 2:00 PM", image: "", experience: "25 years", languages: ["English", "Hindi", "Marathi"], videoCallAvailable: true, lat: 19.0509, lng: 72.8283 },
  { id: 102, name: "Dr. Priya Deshmukh", specialty: "Neurologist", rating: 4.8, reviews: 215, distance: "", address: "Hinduja Hospital, Mahim, Mumbai", availability: "available", nextSlot: "Today, 4:30 PM", image: "", experience: "18 years", languages: ["English", "Hindi", "Marathi"], videoCallAvailable: true, lat: 19.0380, lng: 72.8408 },
  { id: 103, name: "Dr. Suresh Patil", specialty: "Orthopedic", rating: 4.7, reviews: 189, distance: "", address: "Kokilaben Hospital, Andheri West, Mumbai", availability: "busy", nextSlot: "Tomorrow, 11:00 AM", image: "", experience: "20 years", languages: ["English", "Hindi", "Marathi"], videoCallAvailable: true, lat: 19.1310, lng: 72.8260 },
  { id: 104, name: "Dr. Anjali Kulkarni", specialty: "Dermatologist", rating: 4.9, reviews: 278, distance: "", address: "Bombay Hospital, Marine Lines, Mumbai", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "14 years", languages: ["English", "Hindi", "Marathi"], videoCallAvailable: true, lat: 18.9432, lng: 72.8270 },
  { id: 105, name: "Dr. Vikram Joshi", specialty: "General Physician", rating: 4.6, reviews: 410, distance: "", address: "Jaslok Hospital, Pedder Road, Mumbai", availability: "available", nextSlot: "Today, 6:00 PM", image: "", experience: "22 years", languages: ["English", "Hindi", "Gujarati"], videoCallAvailable: true, lat: 18.9712, lng: 72.8054 },
  { id: 106, name: "Dr. Neha Raut", specialty: "Psychiatrist", rating: 4.8, reviews: 156, distance: "", address: "KEM Hospital, Parel, Mumbai", availability: "available", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "12 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 19.0012, lng: 72.8417 },
  { id: 107, name: "Dr. Amol Shirke", specialty: "Pulmonologist", rating: 4.7, reviews: 134, distance: "", address: "Nanavati Hospital, Vile Parle, Mumbai", availability: "busy", nextSlot: "Friday, 9:00 AM", image: "", experience: "16 years", languages: ["English", "Hindi", "Marathi"], videoCallAvailable: true, lat: 19.0990, lng: 72.8432 },
  { id: 108, name: "Dr. Sneha Gadgil", specialty: "Endocrinologist", rating: 4.9, reviews: 198, distance: "", address: "Breach Candy Hospital, Mumbai", availability: "available", nextSlot: "Today, 3:30 PM", image: "", experience: "19 years", languages: ["English", "Hindi", "Marathi"], videoCallAvailable: true, lat: 18.9716, lng: 72.8035 },

  // — Delhi —
  { id: 201, name: "Dr. Arun Kapoor", specialty: "Cardiologist", rating: 4.9, reviews: 387, distance: "", address: "AIIMS, Ansari Nagar, New Delhi", availability: "available", nextSlot: "Today, 2:30 PM", image: "", experience: "28 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 28.5672, lng: 77.2100 },
  { id: 202, name: "Dr. Meenakshi Gupta", specialty: "Neurologist", rating: 4.8, reviews: 245, distance: "", address: "Fortis Escorts, Okhla, New Delhi", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "20 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 28.5355, lng: 77.2753 },
  { id: 203, name: "Dr. Sanjay Verma", specialty: "Orthopedic", rating: 4.7, reviews: 312, distance: "", address: "Max Hospital, Saket, New Delhi", availability: "busy", nextSlot: "Tomorrow, 9:00 AM", image: "", experience: "22 years", languages: ["English", "Hindi", "Punjabi"], videoCallAvailable: true, lat: 28.5274, lng: 77.2128 },
  { id: 204, name: "Dr. Kavita Sharma", specialty: "Dermatologist", rating: 4.9, reviews: 198, distance: "", address: "Sir Ganga Ram Hospital, Delhi", availability: "available", nextSlot: "Today, 4:00 PM", image: "", experience: "15 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 28.6389, lng: 77.1861 },
  { id: 205, name: "Dr. Rohit Saxena", specialty: "General Physician", rating: 4.6, reviews: 456, distance: "", address: "Safdarjung Hospital, New Delhi", availability: "available", nextSlot: "Today, 6:30 PM", image: "", experience: "24 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 28.5685, lng: 77.2066 },
  { id: 206, name: "Dr. Deepa Malhotra", specialty: "Gastroenterologist", rating: 4.8, reviews: 167, distance: "", address: "Apollo Hospital, Jasola, New Delhi", availability: "available", nextSlot: "Tomorrow, 11:00 AM", image: "", experience: "17 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 28.5347, lng: 77.2888 },
  { id: 207, name: "Dr. Pooja Bhatt", specialty: "Ophthalmologist", rating: 4.9, reviews: 210, distance: "", address: "Dr. Shroff's Eye Hospital, Delhi", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "16 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 28.6472, lng: 77.2389 },

  // — Jaipur —
  { id: 301, name: "Dr. Mahesh Agarwal", specialty: "Cardiologist", rating: 4.8, reviews: 234, distance: "", address: "SMS Hospital, JLN Marg, Jaipur", availability: "available", nextSlot: "Today, 2:00 PM", image: "", experience: "23 years", languages: ["English", "Hindi", "Rajasthani"], videoCallAvailable: true, lat: 26.8964, lng: 75.8069 },
  { id: 302, name: "Dr. Sunita Rathore", specialty: "Neurologist", rating: 4.7, reviews: 178, distance: "", address: "Fortis Escorts, Malviya Nagar, Jaipur", availability: "available", nextSlot: "Today, 4:30 PM", image: "", experience: "16 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 26.8606, lng: 75.8053 },
  { id: 303, name: "Dr. Rajendra Singh", specialty: "General Physician", rating: 4.9, reviews: 389, distance: "", address: "Narayana Hospital, Sector 28, Jaipur", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "20 years", languages: ["English", "Hindi", "Rajasthani"], videoCallAvailable: true, lat: 26.8502, lng: 75.8127 },
  { id: 304, name: "Dr. Rekha Meena", specialty: "Dermatologist", rating: 4.8, reviews: 156, distance: "", address: "Manipal Hospital, Sector 5, Jaipur", availability: "busy", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "13 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 26.9110, lng: 75.7647 },
  { id: 305, name: "Dr. Lalit Bohra", specialty: "Orthopedic", rating: 4.7, reviews: 201, distance: "", address: "EHCC Hospital, JLN Marg, Jaipur", availability: "available", nextSlot: "Tomorrow, 11:30 AM", image: "", experience: "18 years", languages: ["English", "Hindi", "Rajasthani"], videoCallAvailable: true, lat: 26.8852, lng: 75.8087 },
  { id: 306, name: "Dr. Nisha Kanwar", specialty: "Psychiatrist", rating: 4.9, reviews: 112, distance: "", address: "Apollo Spectra, C-Scheme, Jaipur", availability: "available", nextSlot: "Today, 6:00 PM", image: "", experience: "11 years", languages: ["English", "Hindi"], videoCallAvailable: true, lat: 26.9124, lng: 75.7873 },

  // — Bangalore —
  { id: 401, name: "Dr. Venkatesh Rao", specialty: "Cardiologist", rating: 4.9, reviews: 298, distance: "", address: "Narayana Health City, Bangalore", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "26 years", languages: ["English", "Hindi", "Kannada"], videoCallAvailable: true, lat: 12.9081, lng: 77.6476 },
  { id: 402, name: "Dr. Lakshmi Iyer", specialty: "Neurologist", rating: 4.8, reviews: 187, distance: "", address: "Manipal Hospital, HAL Airport Rd, Bangalore", availability: "available", nextSlot: "Today, 5:30 PM", image: "", experience: "17 years", languages: ["English", "Kannada", "Tamil"], videoCallAvailable: true, lat: 12.9592, lng: 77.6480 },
  { id: 403, name: "Dr. Kiran Hegde", specialty: "Orthopedic", rating: 4.7, reviews: 223, distance: "", address: "Fortis Hospital, Bannerghatta Rd, Bangalore", availability: "busy", nextSlot: "Tomorrow, 9:30 AM", image: "", experience: "19 years", languages: ["English", "Kannada"], videoCallAvailable: true, lat: 12.8889, lng: 77.5996 },
  { id: 404, name: "Dr. Anitha Narayan", specialty: "General Physician", rating: 4.8, reviews: 345, distance: "", address: "Apollo Hospital, Seshadripuram, Bangalore", availability: "available", nextSlot: "Today, 4:00 PM", image: "", experience: "15 years", languages: ["English", "Hindi", "Kannada"], videoCallAvailable: true, lat: 12.9896, lng: 77.5706 },
  { id: 405, name: "Dr. Suresh Babu", specialty: "Pulmonologist", rating: 4.9, reviews: 167, distance: "", address: "Sakra World Hospital, Bellandur, Bangalore", availability: "available", nextSlot: "Tomorrow, 2:00 PM", image: "", experience: "21 years", languages: ["English", "Kannada", "Telugu"], videoCallAvailable: true, lat: 12.9262, lng: 77.6762 },

  // — Chennai —
  { id: 501, name: "Dr. Ramesh Sundaram", specialty: "Cardiologist", rating: 4.9, reviews: 312, distance: "", address: "Apollo Hospital, Greams Rd, Chennai", availability: "available", nextSlot: "Today, 2:30 PM", image: "", experience: "27 years", languages: ["English", "Hindi", "Tamil"], videoCallAvailable: true, lat: 13.0604, lng: 80.2496 },
  { id: 502, name: "Dr. Padmini Krishnan", specialty: "Dermatologist", rating: 4.8, reviews: 198, distance: "", address: "MIOT Hospital, Manapakkam, Chennai", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "14 years", languages: ["English", "Tamil"], videoCallAvailable: true, lat: 13.0119, lng: 80.1683 },
  { id: 503, name: "Dr. Karthik Rajan", specialty: "General Physician", rating: 4.7, reviews: 267, distance: "", address: "Fortis Malar Hospital, Adyar, Chennai", availability: "available", nextSlot: "Today, 6:00 PM", image: "", experience: "16 years", languages: ["English", "Hindi", "Tamil"], videoCallAvailable: true, lat: 13.0067, lng: 80.2553 },

  // — Kolkata —
  { id: 601, name: "Dr. Soumitra Banerjee", specialty: "Neurologist", rating: 4.8, reviews: 234, distance: "", address: "AMRI Hospital, Dhakuria, Kolkata", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "21 years", languages: ["English", "Hindi", "Bengali"], videoCallAvailable: true, lat: 22.5082, lng: 88.3625 },
  { id: 602, name: "Dr. Rina Chatterjee", specialty: "General Physician", rating: 4.7, reviews: 378, distance: "", address: "Fortis Hospital, Anandapur, Kolkata", availability: "available", nextSlot: "Today, 5:30 PM", image: "", experience: "18 years", languages: ["English", "Hindi", "Bengali"], videoCallAvailable: true, lat: 22.5110, lng: 88.3994 },
  { id: 603, name: "Dr. Abhijit Sen", specialty: "Orthopedic", rating: 4.9, reviews: 189, distance: "", address: "Apollo Gleneagles, Kolkata", availability: "busy", nextSlot: "Tomorrow, 11:00 AM", image: "", experience: "23 years", languages: ["English", "Hindi", "Bengali"], videoCallAvailable: true, lat: 22.5148, lng: 88.3706 },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"list" | "map" | "split">("split");
  const [showSchemeOnly, setShowSchemeOnly] = useState(false);
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<string>("all");
  const [schemeCategory, setSchemeCategory] = useState<"all" | "central" | "state">("all");
  const [availableSchemes, setAvailableSchemes] = useState<{ short_name: string; name: string; is_national: boolean; state: string }[]>([]);
  const [userState, setUserState] = useState<string | null>(null);
  const [schemeDoctors, setSchemeDoctors] = useState<SchemeDoctor[]>([]);
  const [schemeDoctorsLoading, setSchemeDoctorsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "granted" | "denied">("idle");
  const [locationName, setLocationName] = useState("Detecting location...");
  const [maxDistance, setMaxDistance] = useState<number>(25);
  const [manualLocationQuery, setManualLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSource, setLocationSource] = useState<"gps" | "manual">("gps");
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);

  // Booking state
  const [bookingDoctor, setBookingDoctor] = useState<any>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const handleBookClick = async (doctor: any) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setBookingDoctor(doctor);
    setBookingOpen(true);
  };

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
        setLocationSource("gps");
        setLocationName(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
        // Reverse geocode
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
          .then((r) => r.json())
          .then((data) => {
            if (data.address) {
              const parts = [data.address.suburb || data.address.neighbourhood, data.address.city || data.address.town, data.address.state].filter(Boolean);
              setLocationName(parts.join(", ") || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
              if (data.address.state) {
                setUserState(data.address.state);
              }
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

  // Fetch scheme doctors from DB
  useEffect(() => {
    const fetchSchemeDoctors = async () => {
      setSchemeDoctorsLoading(true);

      // Fetch all schemes for the filter dropdown
      const { data: schemesData } = await supabase
        .from("government_schemes_db")
        .select("short_name, name, is_national, state")
        .order("is_national", { ascending: false })
        .order("state");
      if (schemesData) setAvailableSchemes(schemesData as any);

      const { data, error } = await supabase
        .from("scheme_doctors")
        .select(`
          id, name, specialization, languages, experience,
          hospital:hospitals!inner(id, name, address, city, state, latitude, longitude, phone),
          hospitals!inner(
            hospital_schemes(
              scheme:government_schemes_db(short_name, name, coverage, description, eligibility, official_url, is_national, state)
            )
          )
        `);

      if (!error && data) {
        const mapped: SchemeDoctor[] = (data as any[]).map((d) => ({
          id: d.id,
          name: d.name,
          specialization: d.specialization,
          languages: d.languages || "",
          experience: d.experience || "",
          hospital: d.hospital,
          schemes: d.hospitals?.hospital_schemes?.map((hs: any) => hs.scheme) || [],
        }));
        setSchemeDoctors(mapped);
      }
      setSchemeDoctorsLoading(false);
    };
    fetchSchemeDoctors();
  }, []);

  const searchLocation = useCallback((query: string) => {
    setManualLocationQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    searchTimeoutRef.current = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`)
        .then((r) => r.json())
        .then((data) => {
          setLocationSuggestions(data || []);
          setIsSearchingLocation(false);
        })
        .catch(() => {
          setLocationSuggestions([]);
          setIsSearchingLocation(false);
        });
    }, 300);
  }, []);

  const selectLocation = useCallback((suggestion: { display_name: string; lat: string; lon: string }) => {
    const loc = { lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) };
    setUserLocation(loc);
    setLocationStatus("granted");
    setLocationSource("manual");
    const parts = suggestion.display_name.split(",");
    setLocationName(parts.slice(0, 2).join(",").trim());
    setManualLocationQuery("");
    setLocationSuggestions([]);
    // Extract state from reverse geocode for scheme filtering
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`)
      .then((r) => r.json())
      .then((data) => {
        if (data.address?.state) setUserState(data.address.state);
      })
      .catch(() => {});
  }, []);

  // Compute real distances if location is available
  const doctorsWithDistance = mockDoctors.map((doc) => {
    if (userLocation) {
      const dist = haversineDistance(userLocation.lat, userLocation.lng, doc.lat, doc.lng);
      return { ...doc, distance: `${dist.toFixed(1)} km`, _distanceNum: dist };
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

  // Filter scheme doctors by specialty, search, and distance
  const filteredSchemeDoctors = schemeDoctors
    .map((d) => {
      if (userLocation) {
        const dist = haversineDistance(userLocation.lat, userLocation.lng, d.hospital.latitude, d.hospital.longitude);
        return { ...d, distance: dist };
      }
      return d;
    })
    .filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.hospital.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty =
        selectedSpecialty === "All Specialties" ||
        d.specialization === selectedSpecialty;
      const matchesDistance = d.distance === undefined || d.distance <= maxDistance;
      const matchesScheme =
        selectedSchemeFilter === "all" ||
        d.schemes.some((s) => s.short_name === selectedSchemeFilter);
      // Category filter: only show doctors whose hospital has schemes matching the category
      const matchesCategory = schemeCategory === "all" || d.schemes.some((s) => {
        const schemeInfo = availableSchemes.find((as) => as.short_name === s.short_name);
        if (!schemeInfo) return false;
        if (schemeCategory === "central") return schemeInfo.is_national;
        if (schemeCategory === "state") return !schemeInfo.is_national;
        return true;
      });
      return matchesSearch && matchesSpecialty && matchesDistance && matchesScheme && matchesCategory;
    })
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

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
                {locationStatus === "granted" && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    locationSource === "gps" ? "bg-success/15 text-success" : "bg-primary/15 text-primary"
                  }`}>
                    {locationSource === "gps" ? "GPS" : "Manual"}
                  </span>
                )}
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

              {/* Manual location search */}
              <div className="relative flex-1 min-w-0 sm:max-w-xs">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={manualLocationQuery}
                    onChange={(e) => searchLocation(e.target.value)}
                    placeholder="Search a city or place..."
                    className="w-full pl-9 pr-3 py-2 bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-xs"
                  />
                  {isSearchingLocation && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
                {locationSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    {locationSuggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => selectLocation(s)}
                        className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-primary/10 transition-colors border-b border-border/50 last:border-b-0 truncate"
                      >
                        <MapPin className="w-3 h-3 inline mr-1.5 text-primary" />
                        {s.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Distance radius */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Radius:</span>
                <div className="flex gap-1">
                  {[5, 10, 25, 50, 100].map((d) => (
                    <button
                      key={d}
                      onClick={() => setMaxDistance(d)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        maxDistance === d
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                      }`}
                    >
                      {d} km
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

          {/* Toolbar: count + sort + scheme toggle */}
          <motion.div
            className="flex flex-wrap items-center justify-between gap-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">
                  {showSchemeOnly ? filteredSchemeDoctors.length : sortedDoctors.length}
                </span> specialist{(showSchemeOnly ? filteredSchemeDoctors.length : sortedDoctors.length) !== 1 && "s"}
                {selectedSpecialty !== "All Specialties" && (
                  <span> in <span className="text-primary font-medium">{selectedSpecialty}</span></span>
                )}
                <span className="text-muted-foreground"> within {maxDistance} km</span>
              </p>
              <button
                onClick={() => setShowSchemeOnly(!showSchemeOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  showSchemeOnly
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Free Treatment
              </button>
              {showSchemeOnly && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Central / State category toggle */}
                  {(["all", "central", "state"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setSchemeCategory(cat); setSelectedSchemeFilter("all"); }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                        schemeCategory === cat
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat === "all" ? "All" : cat === "central" ? "Central" : userState || "State"}
                    </button>
                  ))}
                  {/* Filtered scheme dropdown */}
                  <select
                    value={selectedSchemeFilter}
                    onChange={(e) => setSelectedSchemeFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all max-w-[220px]"
                  >
                    <option value="all">All Schemes</option>
                    {schemeCategory !== "state" && (
                      <optgroup label="🏛️ Central Government Schemes">
                        {availableSchemes.filter(s => s.is_national).map((s) => (
                          <option key={s.short_name} value={s.short_name}>
                            {s.short_name} — {s.name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {schemeCategory !== "central" && (
                      <optgroup label={`🏠 State Schemes${userState ? ` (${userState})` : ""}`}>
                        {availableSchemes
                          .filter(s => !s.is_national)
                          .filter(s => !userState || s.state.toLowerCase().includes(userState.toLowerCase()) || schemeCategory === "all")
                          .map((s) => (
                            <option key={s.short_name} value={s.short_name}>
                              {s.short_name} — {s.name} ({s.state})
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                  {userState && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      📍 {userState}
                    </span>
                  )}
                </div>
              )}
            </div>
            {!showSchemeOnly && (
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
            )}
          </motion.div>

          {/* Main content */}
          {showSchemeOnly ? (
            <div className={`${viewMode === "split" ? "grid lg:grid-cols-2 gap-6" : ""}`}>
              {schemeDoctorsLoading ? (
                <div className="text-center py-20 text-muted-foreground">Loading government scheme doctors...</div>
              ) : filteredSchemeDoctors.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-muted flex items-center justify-center">
                    <Shield className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">No scheme doctors found</h3>
                  <p className="text-sm text-muted-foreground mb-4">Try increasing the radius or changing specialty</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedSpecialty("All Specialties"); setMaxDistance(100); }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <>
                  {viewMode !== "map" && (
                    <motion.div
                      className={`grid gap-5 ${viewMode === "split" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={viewMode === "split" ? { maxHeight: "70vh", overflowY: "auto", paddingRight: 4 } : {}}
                    >
                      {filteredSchemeDoctors.map((doctor, index) => (
                        <SchemeDoctorCard key={doctor.id} doctor={doctor} index={index} />
                      ))}
                    </motion.div>
                  )}
                  {viewMode !== "list" && (
                    <motion.div
                      className="glass-panel overflow-hidden"
                      style={{ height: "70vh" }}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <DoctorMap
                        doctors={schemeMapDoctors}
                        userLocation={userLocation}
                      />
                    </motion.div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className={`${viewMode === "split" ? "grid lg:grid-cols-2 gap-6" : ""}`}>
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
                      <DoctorCard key={doctor.id} doctor={doctor} index={index} onBook={handleBookClick} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

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
          )}

          {!showSchemeOnly && sortedDoctors.length === 0 && (
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
                onClick={() => { setSearchQuery(""); setSelectedSpecialty("All Specialties"); setMaxDistance(100); }}
                className="text-sm text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </main>

      {bookingDoctor && (
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          doctor={bookingDoctor}
        />
      )}
    </div>
  );
};

export default DoctorDirectory;
