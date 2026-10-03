import { ArrowRight, Braces, Cpu, Github, Database, Terminal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import StudioPreview from "./landing/StudioPreview";
import Reveal from "./landing/Reveal";

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const reducedMotion = useReducedMotion();
  const ease = [0.16, 1, 0.3, 1] as const;
  const copyReveal = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.6, ease } },
  };
  const lineReveal = {
    hidden: { y: "110%" },
    visible: { y: "0%", transition: { duration: reducedMotion ? 0 : 0.75, ease } },
  };
  return (
    <section className="nbl-hero" aria-labelledby="hero-title">
      <div className="nbl-cosmos" aria-hidden="true">
        <div className="nbl-orbit nbl-orbit-one" />
        <div className="nbl-orbit nbl-orbit-two" />
        <div className="nbl-orbit-core" />
      </div>
      <div className="nbl-container nbl-hero-grid">
        <motion.div
          className="nbl-hero-copy"
          initial={reducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                delayChildren: reducedMotion ? 0 : 0.08,
                staggerChildren: reducedMotion ? 0 : 0.12,
              },
            },
          }}
        >
          <h1 id="hero-title">
            <span className="nbl-hero-line">
              <motion.span variants={lineReveal}>Your data.</motion.span>
            </span>
            <span className="nbl-hero-line">
              <motion.span variants={lineReveal}>
                Your <span className="nbl-hero-accent">universe.</span>
              </motion.span>
            </span>
          </h1>
          <motion.p className="nbl-hero-description" variants={copyReveal}>
            Provision isolated databases, manage them in Studio, and connect your app through REST.
          </motion.p>
          <motion.div className="nbl-hero-actions" variants={copyReveal}>
            <Link
              className="nbl-button nbl-button-primary"
              to={isAuthenticated && user?.userId ? `/dashboard/${user.userId}` : "/sign-up"}
            >
              {isAuthenticated ? "Open your Studio" : "Start building free"}
              <ArrowRight size={17} />
            </Link>
            <a
              className="nbl-button nbl-button-secondary"
              href="https://github.com/Annany2002/nebula-backend"
              target="_blank"
              rel="noreferrer"
            >
              <Github size={17} /> Explore GitHub
            </a>
          </motion.div>
        </motion.div>
        <motion.div
          className="nbl-hero-visual"
          initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, delay: reducedMotion ? 0 : 0.28, ease }}
        >
          <div className="nbl-visual-label">
            <span>Meet your new control center</span>
            <span className="nbl-visual-line" />
            <span>01 / STUDIO</span>
          </div>
          <StudioPreview />
        </motion.div>
      </div>
      <Reveal className="nbl-container nbl-hero-bottom" delay={0.22}>
        <dl className="nbl-stack" aria-label="Nebula technology stack">
          {[
            { name: "SQLite", description: "Isolated storage", icon: Database },
            { name: "Go", description: "Backend engine", icon: Cpu },
            { name: "REST API", description: "Standard HTTP", icon: Braces },
            { name: "TypeScript SDK", description: "Typed access", icon: Terminal },
          ].map(({ name, description, icon: Icon }) => (
            <div key={name}>
              <dt>
                <Icon size={22} aria-hidden="true" />
                {name}
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
};

export default Hero;
