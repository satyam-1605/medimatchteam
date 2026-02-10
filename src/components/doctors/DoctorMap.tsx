import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface DoctorLocation {
  id: number;
  name: string;
  specialty: string;
  lat: number;
  lng: number;
  availability: "available" | "busy" | "offline";
  rating: number;
  nextSlot: string;
}

interface DoctorMapProps {
  doctors: DoctorLocation[];
  userLocation: { lat: number; lng: number } | null;
  onDoctorSelect?: (id: number) => void;
  className?: string;
}

const availabilityColors: Record<string, string> = {
  available: "#22c55e",
  busy: "#f59e0b",
  offline: "#6b7280",
};

const DoctorMap = ({ doctors, userLocation, onDoctorSelect, className = "" }: DoctorMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clean up previous instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const center: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [40.7128, -74.006]; // Default NYC

    const map = L.map(mapRef.current, {
      center,
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-location-marker",
        html: `<div style="width:16px;height:16px;background:hsl(180,100%,50%);border-radius:50%;border:3px solid hsl(180,100%,80%);box-shadow:0 0 16px hsl(180,100%,50%,0.7),0 0 32px hsl(180,100%,50%,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)
        .bindPopup(`<div style="font-family:Inter,sans-serif;color:#fff;"><strong>Your Location</strong></div>`, { className: "dark-popup" });
    }

    // Doctor markers
    doctors.forEach((doc) => {
      const color = availabilityColors[doc.availability];
      const icon = L.divIcon({
        className: "doctor-map-marker",
        html: `
          <div style="position:relative;cursor:pointer;">
            <div style="width:32px;height:32px;background:${color}22;border:2px solid ${color};border-radius:50%;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);">
              <span style="font-size:14px;font-weight:700;color:${color};">${doc.name.charAt(0)}</span>
            </div>
            ${doc.availability === "available" ? `<div style="position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:${color};border-radius:50%;animation:pulse 2s infinite;"></div>` : ""}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([doc.lat, doc.lng], { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:160px;">
          <p style="margin:0;font-weight:700;font-size:13px;color:#e2e8f0;">${doc.name}</p>
          <p style="margin:2px 0 4px;font-size:11px;color:${color};">${doc.specialty}</p>
          <p style="margin:0;font-size:11px;color:#94a3b8;">⭐ ${doc.rating} · ${doc.nextSlot}</p>
        </div>`,
        { className: "dark-popup" }
      );

      marker.on("click", () => onDoctorSelect?.(doc.id));
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [doctors, userLocation, onDoctorSelect]);

  return (
    <>
      <style>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: hsl(222 47% 7% / 0.95);
          border: 1px solid hsl(220 40% 18%);
          border-radius: 12px;
          box-shadow: 0 0 20px hsl(180 100% 50% / 0.1);
          backdrop-filter: blur(12px);
        }
        .dark-popup .leaflet-popup-tip {
          background: hsl(222 47% 7% / 0.95);
          border: 1px solid hsl(220 40% 18%);
        }
        .dark-popup .leaflet-popup-close-button {
          color: #94a3b8 !important;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }
      `}</style>
      <div ref={mapRef} className={`w-full rounded-2xl ${className}`} style={{ height: "100%" }} />
    </>
  );
};

export default DoctorMap;
