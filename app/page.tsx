import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Organization from "@/components/sections/Organization";
import Programs from "@/components/sections/Programs";
import FAQ from "@/components/sections/FAQ";
import NglBanner from "@/components/sections/NglBanner";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── Dark sections (navy + dots) ──────────────── */}
        <div className="bg-primary-900 relative">
          {/* Background dot pattern shared across all dark sections */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #64b5f6 1.5px, transparent 1.5px)",
              backgroundSize: "28px 28px",
            }}
          />

          <Hero />
          <About />
          <Organization />
          <Programs />
          <NglBanner />
          <FAQ />
          <Footer />
        </div>
      </main>
    </>
  );
}
