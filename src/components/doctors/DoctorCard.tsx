import { useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Calendar,
  ChevronLeft,
  Video,
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
  const [isFlipped, setIsFlipped] = useState(false);
  const availability = availabilityConfig[doctor.availability];

  return (
    <motion.div
      className="relative h-80 perspective-1000"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 glass-panel p-6 cursor-pointer backface-hidden"
          onClick={() => setIsFlipped(true)}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex gap-4">
            {/* Doctor image placeholder */}
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-display font-bold text-primary">
                {doctor.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-2 h-2 rounded-full ${availability.color} ${
                    availability.pulse ? "animate-pulse" : ""
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {availability.text}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground truncate">
                {doctor.name}
              </h3>
              <p className="text-sm text-primary">{doctor.specialty}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <span className="font-medium text-foreground">{doctor.rating}</span>
              <span>({doctor.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{doctor.distance} away</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Next: {doctor.nextSlot}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-2" onClick={(e) => e.stopPropagation()}>
            {doctor.videoCallAvailable && (
              <button
                onClick={() => alert("Video call would start here. (Demo)")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                <Video className="w-4 h-4" />
                Video Call
              </button>
            )}
            <GlowButton
              size="sm"
              className="w-full"
              onClick={() => alert("Book appointment flow would open here. (Demo)")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </GlowButton>
          </div>

          {/* Click hint */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground opacity-50">
            Click for details →
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 glass-panel p-6 cursor-pointer backface-hidden"
          onClick={() => setIsFlipped(false)}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="h-full flex flex-col pt-8">
            <h3 className="text-lg font-bold text-foreground mb-2">
              {doctor.name}
            </h3>
            <p className="text-sm text-primary mb-4">{doctor.specialty}</p>

            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Experience</p>
                <p className="text-sm text-foreground">{doctor.experience}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <p className="text-sm text-foreground">{doctor.address}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Languages</p>
                <div className="flex flex-wrap gap-1">
                  {doctor.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 mt-4" onClick={(e) => e.stopPropagation()}>
              {doctor.videoCallAvailable && (
                <button
                  onClick={() => alert("Video call would start here. (Demo)")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-colors font-medium"
                >
                  <Video className="w-4 h-4" />
                  Video Call
                </button>
              )}
              <button
                onClick={() => alert("Book appointment flow would open here. (Demo)")}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" />
                Call Office
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DoctorCard;
