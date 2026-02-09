import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Video,
  Globe,
  Briefcase,
} from "lucide-react";
import GlowButton from "@/components/ui/GlowButton";

interface DoctorCardProps {
  doctor: {
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
    videoCallAvailable?: boolean;
  };
  index?: number;
}

const availabilityConfig = {
  available: {
    color: "bg-success",
    text: "Available Today",
    pulse: true,
  },
  busy: {
    color: "bg-warning",
    text: "Limited Slots",
    pulse: false,
  },
  offline: {
    color: "bg-muted-foreground",
    text: "Next Week",
    pulse: false,
  },
};

const DoctorCard = ({ doctor, index = 0 }: DoctorCardProps) => {
  const availability = availabilityConfig[doctor.availability];

  return (
    <motion.div
      className="group glass-panel overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      {/* Availability banner */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-muted/30">
        <div
          className={`w-2 h-2 rounded-full ${availability.color} ${
            availability.pulse ? "animate-pulse" : ""
          }`}
        />
        <span className="text-xs font-medium text-muted-foreground">
          {availability.text}
        </span>
        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {doctor.nextSlot}
        </span>
      </div>

      <div className="p-5">
        {/* Doctor info */}
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center flex-shrink-0 ring-2 ring-primary/20">
            <span className="text-xl font-display font-bold text-primary">
              {doctor.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {doctor.name}
            </h3>
            <p className="text-sm text-primary/80 font-medium">{doctor.specialty}</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span className="font-semibold text-foreground">{doctor.rating}</span>
                ({doctor.reviews})
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                {doctor.distance}
              </span>
            </div>
          </div>
        </div>

        {/* Details row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            {doctor.experience}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            {doctor.languages.join(", ")}
          </span>
          {doctor.videoCallAvailable && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs text-primary border border-primary/20">
              <Video className="w-3 h-3" />
              Video
            </span>
          )}
        </div>

        {/* Address */}
        <p className="text-xs text-muted-foreground mb-4 truncate">
          <MapPin className="w-3 h-3 inline mr-1" />
          {doctor.address}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {doctor.videoCallAvailable && (
            <button
              onClick={() => alert("Video call would start here. (Demo)")}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Video className="w-4 h-4" />
              Call
            </button>
          )}
          <GlowButton
            size="sm"
            className="flex-1"
            onClick={() => alert("Book appointment flow would open here. (Demo)")}
          >
            <Calendar className="w-4 h-4 mr-1.5" />
            Book
          </GlowButton>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
