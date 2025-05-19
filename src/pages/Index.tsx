import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import UseCases from "@/components/UseCases";

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <Navbar />
      <Hero />
      <UseCases />
      <Features />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
