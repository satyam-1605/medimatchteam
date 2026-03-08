import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Video,
  Globe,
  Briefcase,
  Shield,
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
    schemes?: string[];
    freeUnderScheme?: boolean;
  };
  index?: number;
  onBook?: (doctor: DoctorCardProps["doctor"]) => void;
}

const DoctorCard = ({ doctor, index = 0, onBook }: DoctorCardProps) => {
  const { t } = useTranslation();

  const availabilityConfig = {
    available: { color: "bg-success", textKey: "doctors.available", pulse: true },
    busy: { color: "bg-warning", textKey: "doctors.busy", pulse: false },
    offline: { color: "bg-muted-foreground", textKey: "doctors.offline", pulse: false },
  };

  const availability = availabilityConfig[doctor.availability];

  return (
    <motion.div
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_24px_hsl(var(--primary)/0.12)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      {/* Top banner: availability + next slot */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
        <span className={`w-2 h-2 rounded-full ${availability.color} ${availability.pulse ? "animate-pulse" : ""}`} />
        <span className="text-xs font-medium text-muted-foreground">{t(availability.textKey)}</span>
        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-[120px]">{doctor.nextSlot}</span>
        </span>
      </div>

      {/* Free treatment banner */}
      {doctor.freeUnderScheme && (
        <div className="flex items-center gap-1.5 px-4 py-1.5 bg-success/10 border-b border-success/20">
          <Shield className="w-3.5 h-3.5 text-success flex-shrink-0" />
          <span className="text-xs font-semibold text-success">{t("doctors.freeTreatment")}</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Doctor info row */}
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/25 to-accent/15 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
            <span className="text-lg font-bold text-primary">{doctor.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
              {doctor.name}
            </h3>
            <p className="text-xs text-primary/80 font-medium mt-0.5">{doctor.specialty}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star className="w-3 h-3 text-warning fill-warning flex-shrink-0" />
                <span className="font-semibold text-foreground">{doctor.rating}</span>
                <span className="text-[10px]">({doctor.reviews})</span>
              </span>
              {doctor.distance && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  {doctor.distance}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detail tags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">
            <Briefcase className="w-3 h-3 flex-shrink-0" />
            {doctor.experience}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">
            <Globe className="w-3 h-3 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{doctor.languages.join(", ")}</span>
          </span>
          {doctor.videoCallAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-[11px] text-primary border border-primary/20">
              <Video className="w-3 h-3 flex-shrink-0" />
              Video
            </span>
          )}
        </div>

        {/* Scheme badges */}
        {doctor.schemes && doctor.schemes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {doctor.schemes.map((scheme) => (
              <span
                key={scheme}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success/10 border border-success/20 text-[10px] font-medium text-success"
              >
                <Shield className="w-2.5 h-2.5 flex-shrink-0" />
                {scheme}
              </span>
            ))}
          </div>
        )}

        {/* Address */}
        <p className="text-[11px] text-muted-foreground truncate">
          <MapPin className="w-3 h-3 inline mr-1 flex-shrink-0" />
          {doctor.address}
        </p>

        {/* Actions - pushed to bottom */}
        <div className="flex gap-2 mt-auto pt-1">
          {doctor.videoCallAvailable && (
            <button
              onClick={() => alert("Video call would start here. (Demo)")}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
            >
              <Video className="w-3.5 h-3.5" />
              {t("doctors.videoCall").split(" ")[0]}
            </button>
          )}
          <GlowButton
            size="sm"
            className="flex-1"
            onClick={() => onBook ? onBook(doctor) : alert("Book appointment flow would open here. (Demo)")}
          >
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {t("doctors.bookAppointment").split(" ")[0]}
          </GlowButton>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
