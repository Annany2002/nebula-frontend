import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CodeDemo from "@/components/CodeDemo";
import UseCases from "@/components/UseCases";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import "@/styles/landing.css";

const Index = () => (
  <div className="nebula-landing">
    <a className="nbl-skip" href="#main-content">
      Skip to content
    </a>
    <Navbar />
    <main id="main-content">
      <Hero />
      <Features />
      <CodeDemo />
      <UseCases />
      <FAQ />
    </main>
    <Footer />
  </div>
);

export default Index;
