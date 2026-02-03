import { useState, useRef, useEffect, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { languages, type LanguageCode } from "@/i18n/config";

interface LanguageSelectorProps {
  variant?: "dropdown" | "compact";
  className?: string;
}

const LanguageSelector = ({ variant = "dropdown", className = "" }: LanguageSelectorProps) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  const toggleOpen = (event?: SyntheticEvent) => {
    // Keep the toggle resilient in case some parent overlays/animations interfere.
    event?.preventDefault();
    event?.stopPropagation();
    setIsOpen((v) => !v);
  };

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Dropdown menu rendered via portal (kept simple/reliable)
  const DropdownMenu = () => {
    if (!isOpen) return null;
    return createPortal(
      <motion.div
        ref={dropdownRef}
        initial={{ opacity: 0, y: -10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.15 }}
        className="fixed w-48 rounded-xl shadow-2xl overflow-hidden bg-popover text-popover-foreground border border-border"
        style={{
          top: dropdownPosition.top,
          right: dropdownPosition.right,
          zIndex: 999999,
        }}
      >
        {variant === "dropdown" && (
          <div className="p-2 border-b border-border">
            <p className="px-2 py-1.5 text-xs text-muted-foreground uppercase tracking-wider">
              {t("common.selectLanguage")}
            </p>
          </div>
        )}
        <div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                i18n.language === lang.code
                  ? "bg-primary/15 text-primary"
                  : "hover:bg-muted"
              }`}
            >
              {variant === "dropdown" ? (
                <div className="flex flex-col items-start">
                  <span className="font-medium">{lang.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{lang.name}</span>
                </div>
              ) : (
                <span className="font-medium">{lang.nativeName}</span>
              )}
              {i18n.language === lang.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </motion.div>,
      document.body
    );
  };

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          type="button"
          onPointerDown={toggleOpen}
          onClick={toggleOpen}
          className="p-2 rounded-lg bg-background/80 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground border border-border/50"
          aria-label={t("common.selectLanguage")}
          aria-expanded={isOpen}
          title={t("common.selectLanguage")}
        >
          <Globe className="w-5 h-5" />
        </button>
        <DropdownMenu />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={toggleOpen}
        onClick={toggleOpen}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/80 hover:bg-muted transition-colors text-foreground border border-border/50"
        aria-label={t("common.selectLanguage")}
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <DropdownMenu />
    </div>
  );
};

export default LanguageSelector;
