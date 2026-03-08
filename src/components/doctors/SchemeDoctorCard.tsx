import { useState } from "react";
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
  const [expandedScheme, setExpandedScheme] = useState<string | null>(null);

  return (
    <motion.div
      className="group glass-panel overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      {/* Scheme banner */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border bg-emerald-500/10">
        <Shield className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          Free / Subsidized Treatment
        </span>
        <span className="ml-auto flex gap-1.5 flex-wrap justify-end">
          {doctor.schemes.filter(s => s.is_national).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/25 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              Central
            </span>
          )}
          {doctor.schemes.filter(s => !s.is_national).length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              State
            </span>
          )}
        </span>
      </div>

      <div className="p-5">
        {/* Doctor info */}
        <div className="flex gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500/30 to-emerald-400/20 flex items-center justify-center flex-shrink-0 ring-2 ring-emerald-500/20">
            <span className="text-xl font-display font-bold text-emerald-500">
              {doctor.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
              {doctor.name}
            </h3>
            <p className="text-sm text-emerald-500/80 font-medium">{doctor.specialization}</p>
            <div className="flex items-center gap-3 mt-1">
              {doctor.distance !== undefined && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {doctor.distance.toFixed(1)} km
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            <Briefcase className="w-3 h-3" />
            {doctor.experience}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            <Globe className="w-3 h-3" />
            {doctor.languages}
          </span>
        </div>

        {/* Hospital */}
        <div className="p-3 rounded-xl bg-muted/50 border border-border/50 mb-4">
          <div className="flex items-start gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{doctor.hospital.name}</p>
              <p className="text-xs text-muted-foreground">{doctor.hospital.address}, {doctor.hospital.city}</p>
              {doctor.hospital.phone && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {doctor.hospital.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic scheme list with expandable details */}
        <div className="space-y-2 mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Accepted Schemes ({doctor.schemes.length})
          </p>
          {/* Central schemes first, then state */}
          {[...doctor.schemes].sort((a, b) => (b.is_national ? 1 : 0) - (a.is_national ? 1 : 0)).map((s) => {
            const isExpanded = expandedScheme === s.short_name;
            return (
              <div key={s.short_name} className="rounded-lg border border-border/50 overflow-hidden">
                <button
                  onClick={() => setExpandedScheme(isExpanded ? null : s.short_name)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/50 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-foreground flex-1 truncate">{s.short_name}</span>
                  {s.coverage && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex-shrink-0">
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
                      <div className="px-3 pb-3 space-y-2 border-t border-border/30 pt-2">
                        <p className="text-xs text-foreground font-medium">{s.name}</p>
                        {s.description && (
                          <p className="text-[11px] text-muted-foreground">{s.description}</p>
                        )}
                        {s.eligibility && (
                          <div className="flex items-start gap-1.5">
                            <Users className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <p className="text-[11px] text-muted-foreground">
                              <span className="font-medium text-foreground">Eligibility:</span> {s.eligibility}
                            </p>
                          </div>
                        )}
                        {s.official_url && (
                          <a
                            href={s.official_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
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
        <GlowButton
          size="sm"
          className="w-full bg-emerald-500 hover:bg-emerald-600"
          onClick={() => {
            if (doctor.hospital.phone) {
              window.open(`tel:${doctor.hospital.phone}`);
            } else {
              alert(`Contact ${doctor.hospital.name} to book under government scheme.`);
            }
          }}
        >
          <Phone className="w-4 h-4 mr-1.5" />
          Contact Hospital
        </GlowButton>
      </div>
    </motion.div>
  );
};

export default SchemeDoctorCard;
