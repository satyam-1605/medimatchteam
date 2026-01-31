import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  MapPin,
  Grid,
  List,
  Star,
  Clock,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import DoctorCard from "@/components/doctors/DoctorCard";

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
};

const mockDoctors: Doctor[] = [
  { id: 1, name: "Dr. Sarah Chen", specialty: "Neurologist", rating: 4.9, reviews: 127, distance: "0.8 mi", address: "123 Medical Center Dr, Suite 400", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "15 years", languages: ["English", "Mandarin"], videoCallAvailable: true },
  { id: 2, name: "Dr. Emily Thompson", specialty: "Neurologist", rating: 4.7, reviews: 89, distance: "2.1 mi", address: "789 Brain & Spine Center", availability: "available", nextSlot: "Today, 5:30 PM", image: "", experience: "12 years", languages: ["English"], videoCallAvailable: true },
  { id: 3, name: "Dr. Michael Roberts", specialty: "Cardiologist", rating: 4.8, reviews: 203, distance: "1.2 mi", address: "456 Heart Health Blvd", availability: "busy", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "20 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 4, name: "Dr. Anita Sharma", specialty: "Cardiologist", rating: 4.9, reviews: 156, distance: "1.5 mi", address: "200 Cardiac Care Plaza", availability: "available", nextSlot: "Today, 2:00 PM", image: "", experience: "18 years", languages: ["English", "Hindi"], videoCallAvailable: true },
  { id: 5, name: "Dr. Lisa Park", specialty: "Dermatologist", rating: 4.9, reviews: 156, distance: "1.8 mi", address: "555 Skin Care Center", availability: "busy", nextSlot: "Friday, 11:00 AM", image: "", experience: "10 years", languages: ["English", "Korean"], videoCallAvailable: true },
  { id: 6, name: "Dr. David Kim", specialty: "Dermatologist", rating: 4.6, reviews: 98, distance: "2.4 mi", address: "777 Dermatology Associates", availability: "available", nextSlot: "Tomorrow, 9:00 AM", image: "", experience: "8 years", languages: ["English"], videoCallAvailable: true },
  { id: 7, name: "Dr. Robert Martinez", specialty: "Orthopedic", rating: 4.8, reviews: 178, distance: "3.2 mi", address: "888 Joint & Bone Specialists", availability: "offline", nextSlot: "Next Monday", image: "", experience: "22 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 8, name: "Dr. Jennifer Walsh", specialty: "Orthopedic", rating: 4.7, reviews: 134, distance: "1.0 mi", address: "100 Ortho & Sports Clinic", availability: "available", nextSlot: "Today, 4:00 PM", image: "", experience: "14 years", languages: ["English", "French"], videoCallAvailable: true },
  { id: 9, name: "Dr. James Wilson", specialty: "General Physician", rating: 4.6, reviews: 312, distance: "0.5 mi", address: "321 Family Health Clinic", availability: "available", nextSlot: "Today, 4:15 PM", image: "", experience: "18 years", languages: ["English", "French"], videoCallAvailable: true },
  { id: 10, name: "Dr. Maria Santos", specialty: "General Physician", rating: 4.8, reviews: 245, distance: "0.9 mi", address: "450 Primary Care Center", availability: "available", nextSlot: "Today, 6:00 PM", image: "", experience: "16 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 11, name: "Dr. Rachel Green", specialty: "Psychiatrist", rating: 4.9, reviews: 189, distance: "1.3 mi", address: "600 Mind Wellness Institute", availability: "busy", nextSlot: "Tomorrow, 11:00 AM", image: "", experience: "12 years", languages: ["English"], videoCallAvailable: true },
  { id: 12, name: "Dr. Kevin Patel", specialty: "Psychiatrist", rating: 4.7, reviews: 112, distance: "2.0 mi", address: "301 Behavioral Health Center", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "9 years", languages: ["English", "Hindi"], videoCallAvailable: true },
  { id: 13, name: "Dr. Helen Brooks", specialty: "Rheumatologist", rating: 4.8, reviews: 167, distance: "1.7 mi", address: "222 Arthritis & Joint Care", availability: "available", nextSlot: "Tomorrow, 2:30 PM", image: "", experience: "19 years", languages: ["English"], videoCallAvailable: true },
  { id: 14, name: "Dr. Thomas Reed", specialty: "Rheumatologist", rating: 4.6, reviews: 94, distance: "2.8 mi", address: "333 Rheumatology Center", availability: "offline", nextSlot: "Next Tuesday", image: "", experience: "11 years", languages: ["English", "German"], videoCallAvailable: true },
  { id: 15, name: "Dr. Amy Foster", specialty: "Pulmonologist", rating: 4.9, reviews: 201, distance: "1.1 mi", address: "444 Lung & Breathing Institute", availability: "available", nextSlot: "Today, 3:30 PM", image: "", experience: "17 years", languages: ["English"], videoCallAvailable: true },
  { id: 16, name: "Dr. Mark Hughes", specialty: "Pulmonologist", rating: 4.7, reviews: 88, distance: "2.5 mi", address: "555 Respiratory Care", availability: "busy", nextSlot: "Friday, 10:00 AM", image: "", experience: "13 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 17, name: "Dr. Nina Kowalski", specialty: "Sports Medicine", rating: 4.8, reviews: 145, distance: "0.7 mi", address: "666 Sports Med & Rehab", availability: "available", nextSlot: "Today, 1:00 PM", image: "", experience: "10 years", languages: ["English", "Polish"], videoCallAvailable: true },
  { id: 18, name: "Dr. Chris Taylor", specialty: "Sports Medicine", rating: 4.7, reviews: 76, distance: "1.9 mi", address: "777 Athletic Health Clinic", availability: "available", nextSlot: "Tomorrow, 4:00 PM", image: "", experience: "8 years", languages: ["English"], videoCallAvailable: true },
  { id: 19, name: "Dr. Susan Lee", specialty: "Gastroenterologist", rating: 4.9, reviews: 198, distance: "1.4 mi", address: "888 Digestive Health Center", availability: "busy", nextSlot: "Tomorrow, 9:30 AM", image: "", experience: "21 years", languages: ["English", "Mandarin"], videoCallAvailable: true },
  { id: 20, name: "Dr. Paul Nguyen", specialty: "Gastroenterologist", rating: 4.6, reviews: 102, distance: "2.2 mi", address: "999 GI Associates", availability: "available", nextSlot: "Today, 5:45 PM", image: "", experience: "7 years", languages: ["English", "Vietnamese"], videoCallAvailable: true },
  { id: 21, name: "Dr. Olivia Brown", specialty: "Ophthalmologist", rating: 4.8, reviews: 176, distance: "0.6 mi", address: "111 Vision Care Plaza", availability: "available", nextSlot: "Today, 2:15 PM", image: "", experience: "15 years", languages: ["English"], videoCallAvailable: true },
  { id: 22, name: "Dr. Daniel Clark", specialty: "Ophthalmologist", rating: 4.7, reviews: 119, distance: "1.6 mi", address: "222 Eye Institute", availability: "offline", nextSlot: "Next Wednesday", image: "", experience: "11 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 23, name: "Dr. Fiona O'Brien", specialty: "ENT (Otolaryngologist)", rating: 4.9, reviews: 134, distance: "1.2 mi", address: "333 Ear Nose Throat Center", availability: "available", nextSlot: "Today, 4:30 PM", image: "", experience: "14 years", languages: ["English", "Irish"], videoCallAvailable: true },
  { id: 24, name: "Dr. Alex Rivera", specialty: "ENT (Otolaryngologist)", rating: 4.6, reviews: 87, distance: "2.0 mi", address: "444 ENT Specialists", availability: "available", nextSlot: "Tomorrow, 11:30 AM", image: "", experience: "9 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 25, name: "Dr. Emma Watson", specialty: "Allergist / Immunologist", rating: 4.8, reviews: 156, distance: "1.0 mi", address: "555 Allergy & Asthma Center", availability: "busy", nextSlot: "Friday, 9:00 AM", image: "", experience: "12 years", languages: ["English"], videoCallAvailable: true },
  { id: 26, name: "Dr. Ryan Mitchell", specialty: "Allergist / Immunologist", rating: 4.7, reviews: 92, distance: "2.3 mi", address: "666 Immunology Associates", availability: "available", nextSlot: "Today, 6:30 PM", image: "", experience: "8 years", languages: ["English"], videoCallAvailable: true },
  { id: 27, name: "Dr. Sophie Martin", specialty: "Sleep Specialist", rating: 4.9, reviews: 143, distance: "1.5 mi", address: "777 Sleep Disorders Center", availability: "available", nextSlot: "Tomorrow, 3:00 PM", image: "", experience: "16 years", languages: ["English", "French"], videoCallAvailable: true },
  { id: 28, name: "Dr. James Liu", specialty: "Sleep Specialist", rating: 4.6, reviews: 78, distance: "2.6 mi", address: "888 Sleep Health Clinic", availability: "offline", nextSlot: "Next Thursday", image: "", experience: "10 years", languages: ["English", "Mandarin"], videoCallAvailable: true },
  { id: 29, name: "Dr. Laura Bennett", specialty: "Physiatrist (PM&R)", rating: 4.8, reviews: 167, distance: "0.8 mi", address: "999 Rehab & PM&R Center", availability: "available", nextSlot: "Today, 1:30 PM", image: "", experience: "14 years", languages: ["English"], videoCallAvailable: true },
  { id: 30, name: "Dr. Eric Johnson", specialty: "Physiatrist (PM&R)", rating: 4.7, reviews: 95, distance: "1.8 mi", address: "100 Physical Medicine Associates", availability: "busy", nextSlot: "Tomorrow, 10:00 AM", image: "", experience: "11 years", languages: ["English", "Swedish"], videoCallAvailable: true },
  { id: 31, name: "Dr. Priya Nair", specialty: "Infectious Disease", rating: 4.9, reviews: 112, distance: "2.1 mi", address: "200 ID & Travel Medicine", availability: "available", nextSlot: "Today, 5:00 PM", image: "", experience: "18 years", languages: ["English", "Hindi", "Tamil"], videoCallAvailable: true },
  { id: 32, name: "Dr. William Davis", specialty: "Infectious Disease", rating: 4.7, reviews: 84, distance: "0.9 mi", address: "300 Infection Control Center", availability: "offline", nextSlot: "Next Monday", image: "", experience: "13 years", languages: ["English"], videoCallAvailable: true },
  { id: 33, name: "Dr. Catherine Moore", specialty: "Urologist", rating: 4.8, reviews: 189, distance: "1.3 mi", address: "400 Urology Center", availability: "available", nextSlot: "Tomorrow, 2:00 PM", image: "", experience: "20 years", languages: ["English"], videoCallAvailable: true },
  { id: 34, name: "Dr. Andrew Scott", specialty: "Urologist", rating: 4.6, reviews: 106, distance: "2.4 mi", address: "500 Urology Associates", availability: "busy", nextSlot: "Friday, 11:00 AM", image: "", experience: "9 years", languages: ["English", "Scottish"], videoCallAvailable: true },
  { id: 35, name: "Dr. Michelle Adams", specialty: "Endocrinologist", rating: 4.9, reviews: 178, distance: "1.1 mi", address: "600 Diabetes & Hormone Center", availability: "available", nextSlot: "Today, 4:00 PM", image: "", experience: "17 years", languages: ["English"], videoCallAvailable: true },
  { id: 36, name: "Dr. Brian Cooper", specialty: "Endocrinologist", rating: 4.7, reviews: 91, distance: "1.9 mi", address: "700 Endocrinology Institute", availability: "offline", nextSlot: "Next Tuesday", image: "", experience: "12 years", languages: ["English", "Spanish"], videoCallAvailable: true },
  { id: 37, name: "Dr. Nancy Phillips", specialty: "Pain Management", rating: 4.8, reviews: 198, distance: "0.5 mi", address: "800 Pain Relief Center", availability: "available", nextSlot: "Today, 3:00 PM", image: "", experience: "22 years", languages: ["English"], videoCallAvailable: true },
  { id: 38, name: "Dr. Steven Turner", specialty: "Pain Management", rating: 4.6, reviews: 124, distance: "2.0 mi", address: "900 Chronic Pain Clinic", availability: "busy", nextSlot: "Tomorrow, 1:00 PM", image: "", experience: "15 years", languages: ["English"], videoCallAvailable: true },
];

const DoctorDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);

  const filteredDoctors = mockDoctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All Specialties" ||
      doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "distance")
      return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === "reviews") return b.reviews - a.reviews;
    return 0;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="headline-gradient">Find Specialists</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse our network of verified healthcare professionals
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            className="glass-panel p-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctors or specialties..."
                  className="w-full pl-12 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {/* Specialty Filter */}
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="appearance-none w-full lg:w-48 px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === "grid"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-all ${
                    viewMode === "list"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <div className="flex gap-2">
                {[
                  { value: "rating", icon: Star, label: "Rating" },
                  { value: "distance", icon: MapPin, label: "Distance" },
                  { value: "reviews", icon: Clock, label: "Reviews" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      sortBy === option.value
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <option.icon className="w-3.5 h-3.5" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="text-foreground font-medium">
                {sortedDoctors.length}
              </span>{" "}
              specialists
              {selectedSpecialty !== "All Specialties" && (
                <span>
                  {" "}
                  in <span className="text-primary">{selectedSpecialty}</span>
                </span>
              )}
            </p>
          </motion.div>

          {/* Doctor Grid/List */}
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {sortedDoctors.map((doctor, index) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {sortedDoctors.length === 0 && (
            <motion.div
              className="text-center py-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No doctors found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DoctorDirectory;
