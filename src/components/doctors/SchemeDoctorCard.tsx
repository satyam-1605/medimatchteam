import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  Globe,
  Shield,
  Building2,
  Phone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Users,
} from "lucide-react";
import GlowButton from "@/components/ui/GlowButton";

export interface SchemeInfo {
  short_name: string;
  name: string;
  coverage: string | null;
  eligibility: string | null;
  official_url: string | null;
  description: string | null;
  is_national?: boolean;
  state?: string;
}

export interface SchemeDoctor {
  id: string;
  name: string;
  specialization: string;
  languages: string;
  experience: string;
  hospital: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    phone: string | null;
  };
  schemes: SchemeInfo[];
  distance?: number;
}

interface SchemeDoctorCardProps {
  doctor: SchemeDoctor;
  index?: number;
}

const SchemeDoctorCard = ({ doctor, index = 0 }: SchemeDoctorCardProps) => {
  const { t } = useTranslation();
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  const hasCentral = doctor.schemes.some((s) => s.is_national);
  const hasState = doctor.schemes.some((s) => !s.is_national);

  return (
    <motion.div
      className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:border-success/40 hover:shadow-[0_0_24px_hsl(var(--success)/0.12)]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      {/* Free treatment banner */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-success/8">
        <Shield className="w-3.5 h-3.5 text-success flex-shrink-0" />
        <span className="text-xs font-semibold text-success">
          {t("doctors.freeTreatment")}
        </span>
        <span className="ml-auto flex gap-1.5 flex-wrap justify-end">
          {hasCentral && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
              {t("doctors.central")}
            </span>
          )}
          {hasState && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-warning/10 text-warning border border-warning/20">
              {t("doctors.stateSchemes")}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Doctor info */}
        <div className="flex gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/25 to-success/10 flex items-center justify-center flex-shrink-0 ring-1 ring-success/20">
            <span className="text-lg font-bold text-success">{doctor.name.charAt(0)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate group-hover:text-success transition-colors leading-tight">
              {doctor.name}
            </h3>
            <p className="text-xs text-success/80 font-medium mt-0.5">{doctor.specialization}</p>
            {doctor.distance !== undefined && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {doctor.distance.toFixed(1)} km
              </span>
            )}
          </div>
        </div>

        {/* Detail tags */}
        <div className="flex flex-wrap gap-1.5">
          {doctor.experience && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">
              <Briefcase className="w-3 h-3 flex-shrink-0" />
              {doctor.experience}
            </span>
          )}
          {doctor.languages && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[11px] text-muted-foreground">
              <Globe className="w-3 h-3 flex-shrink-0" />
              <span className="truncate max-w-[120px]">{doctor.languages}</span>
            </span>
          )}
        </div>

        {/* Hospital info */}
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
          <div className="flex items-start gap-2">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-foreground truncate">{doctor.hospital.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{doctor.hospital.address}, {doctor.hospital.city}</p>
              {doctor.hospital.phone && (
                <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  {doctor.hospital.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Scheme list */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("doctors.allSchemes")} ({doctor.schemes.length})
          </p>
          {[...doctor.schemes]
            .sort((a, b) => (b.is_national ? 1 : 0) - (a.is_national ? 1 : 0))
            .map((s) => {
              const isExpanded = expandedScheme === s.short_name;
              return (
                <div key={s.short_name} className="rounded-lg border border-border/50 overflow-hidden">
                  <button
                    onClick={() => setExpandedScheme(isExpanded ? null : s.short_name)}
                    className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <CheckCircle className="w-3 h-3 text-success flex-shrink-0" />
                    <span className={`px-1 py-0 rounded text-[9px] font-bold flex-shrink-0 ${
                      s.is_national
                        ? "bg-primary/10 text-primary"
                        : "bg-warning/10 text-warning"
                    }`}>
                      {s.is_national ? t("doctors.central") : t("doctors.stateSchemes")}
                    </span>
                    <span className="text-[11px] font-medium text-foreground flex-1 truncate">{s.short_name}</span>
                    {s.coverage && (
                      <span className="text-[10px] font-medium text-success flex-shrink-0 hidden sm:inline">
                        {s.coverage}
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-2.5 pb-2.5 space-y-1.5 border-t border-border/30 pt-2">
                          <p className="text-[11px] text-foreground font-medium">{s.name}</p>
                          {s.description && (
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{s.description}</p>
                          )}
                          {s.eligibility && (
                            <div className="flex items-start gap-1">
                              <Users className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                              <p className="text-[10px] text-muted-foreground">
                                <span className="font-medium text-foreground">Eligibility:</span> {s.eligibility}
                              </p>
                            </div>
                          )}
                          {s.official_url && (
                            <a
                              href={s.official_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-success hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Official Portal
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-1">
          <GlowButton
            size="sm"
            className="w-full"
            onClick={() => {
              if (doctor.hospital.phone) {
                window.open(`tel:${doctor.hospital.phone}`);
              } else {
                alert(`Contact ${doctor.hospital.name} to book under government scheme.`);
              }
            }}
          >
            <Phone className="w-3.5 h-3.5 mr-1" />
            {t("doctors.bookAppointment").split(" ")[0]}
          </GlowButton>
        </div>
      </div>
    </motion.div>
  );
};

export default SchemeDoctorCard;
