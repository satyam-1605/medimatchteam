import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Radar, HeartPulse, Users, Shield, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import ParticleBackground from "@/components/ui/ParticleBackground";
import TypewriterText from "@/components/ui/TypewriterText";
import MedicalCross from "@/components/ui/MedicalCross";
import FeatureCard from "@/components/ui/FeatureCard";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import GlowButton from "@/components/ui/GlowButton";
import Navbar from "@/components/layout/Navbar";

const Index = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Brain,
      title: t("home.features.aiAnalysis.title"),
      description: t("home.features.aiAnalysis.description"),
      animation: "pulse" as const,
    },
    {
      icon: Radar,
      title: t("home.features.instantMatching.title"),
      description: t("home.features.instantMatching.description"),
      animation: "radar" as const,
    },
    {
      icon: HeartPulse,
      title: t("home.features.emergencyDetection.title"),
      description: t("home.features.emergencyDetection.description"),
      animation: "heartbeat" as const,
    },
  ];

  const stats = [
    { value: 98, suffix: "%", label: t("home.stats.accuracyRate") },
    { value: 10000, suffix: "+", label: t("home.stats.patientsMatched") },
    { value: 500, suffix: "+", label: t("home.stats.specialists") },
    { value: 24, suffix: "/7", label: t("home.stats.availability") },
  ];

  const trustItems = [
    { icon: Shield, title: t("home.trust.hipaaCompliant"), desc: t("home.trust.hipaaDesc") },
    { icon: Users, title: t("home.trust.verifiedSpecialists"), desc: t("home.trust.verifiedDesc") },
    { icon: Clock, title: t("home.trust.available247"), desc: t("home.trust.available247Desc") },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <ParticleBackground />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              className="text-center lg:text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
                  🏥 {t("home.tagline")}
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6"
              >
                <TypewriterText
                  text={t("home.headline")}
                  delay={50}
                  className="headline-gradient"
                />
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
              >
                {t("home.subheadline")}
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <Link to="/symptoms">
                  <GlowButton size="lg">
                    {t("home.startFreeAnalysis")}
                  </GlowButton>
                </Link>
                <Link to="/doctors">
                  <motion.button
                    className="px-8 py-4 rounded-full border border-border text-foreground font-semibold hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t("home.browseSpecialists")}
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: 3D Medical Cross */}
            <motion.div
              className="hidden lg:flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <MedicalCross size={400} />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="glass-panel p-8 md:p-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="stats-number mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-muted-foreground text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              {t("home.howItWorks").split("MediMatch")[0]}
              <span className="text-primary text-glow">MediMatch</span>
              {t("home.howItWorks").split("MediMatch")[1] || ""}
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {t("home.howItWorksSubtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
                iconAnimation={feature.animation}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {trustItems.map((item, index) => (
              <motion.div
                key={item.title}
                className="flex items-center gap-4 glass-panel p-6"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="glass-panel p-12 md:p-16 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                {t("home.cta.ready")}
              </h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                {t("home.cta.ctaSubtitle")}
              </p>
              <Link to="/symptoms">
                <GlowButton size="lg">
                  {t("home.startFreeAnalysis")}
                </GlowButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-6 h-6 text-primary" />
              <span className="font-display font-bold">{t("common.appName")}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("home.footer.copyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
