import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import CodeDemo from "@/components/CodeDemo";
import UseCases from "@/components/UseCases";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent relative z-10 selection:bg-purple-500/30">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <CodeDemo />
        <UseCases />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
