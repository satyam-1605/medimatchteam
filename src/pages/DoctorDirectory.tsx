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
  "Neurologist",
  "Cardiologist",
  "Dermatologist",
  "Orthopedist",
  "Pediatrician",
  "Psychiatrist",
  "General Practitioner",
];

const mockDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    specialty: "Neurologist",
    rating: 4.9,
    reviews: 127,
    distance: "0.8 mi",
    address: "123 Medical Center Dr, Suite 400",
    availability: "available" as const,
    nextSlot: "Today, 3:00 PM",
    image: "",
    experience: "15 years of experience",
    languages: ["English", "Mandarin"],
  },
  {
    id: 2,
    name: "Dr. Michael Roberts",
    specialty: "Cardiologist",
    rating: 4.8,
    reviews: 203,
    distance: "1.2 mi",
    address: "456 Heart Health Blvd",
    availability: "busy" as const,
    nextSlot: "Tomorrow, 10:00 AM",
    image: "",
    experience: "20 years of experience",
    languages: ["English", "Spanish"],
  },
  {
    id: 3,
    name: "Dr. Emily Thompson",
    specialty: "Neurologist",
    rating: 4.7,
    reviews: 89,
    distance: "2.1 mi",
    address: "789 Brain & Spine Center",
    availability: "available" as const,
    nextSlot: "Today, 5:30 PM",
    image: "",
    experience: "12 years of experience",
    languages: ["English"],
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "General Practitioner",
    rating: 4.6,
    reviews: 312,
    distance: "0.5 mi",
    address: "321 Family Health Clinic",
    availability: "available" as const,
    nextSlot: "Today, 4:15 PM",
    image: "",
    experience: "18 years of experience",
    languages: ["English", "French"],
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    specialty: "Dermatologist",
    rating: 4.9,
    reviews: 156,
    distance: "1.8 mi",
    address: "555 Skin Care Center",
    availability: "busy" as const,
    nextSlot: "Friday, 11:00 AM",
    image: "",
    experience: "10 years of experience",
    languages: ["English", "Korean"],
  },
  {
    id: 6,
    name: "Dr. Robert Martinez",
    specialty: "Orthopedist",
    rating: 4.8,
    reviews: 178,
    distance: "3.2 mi",
    address: "888 Joint & Bone Specialists",
    availability: "offline" as const,
    nextSlot: "Next Monday",
    image: "",
    experience: "22 years of experience",
    languages: ["English", "Spanish", "Portuguese"],
  },
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
