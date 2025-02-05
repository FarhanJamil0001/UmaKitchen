import { AccordionComponent } from "@/components/homepage/accordion-component";
import BlogSample from "@/components/homepage/blog-samples";
import HeroSection from "@/components/homepage/hero-section";
import MarketingCards from "@/components/homepage/marketing-cards";
import Pricing from "@/components/homepage/pricing";
import SideBySide from "@/components/homepage/side-by-side";
import OrderPageWrapper from "@/components/wrapper/order-page-wrapper";
import PageWrapper from "@/components/wrapper/page-wrapper";
import config from "@/config";

export default function Home() {
  return (
    <OrderPageWrapper>
      {/* Hero Section with Background */}
      <div
        className="relative flex flex-col justify-center items-center w-full min-h-screen p-6 md:p-12 bg-gradient-to-b from-black/40 to-black/60"
        style={{
          backgroundImage: "url('/imgs/vecteezy_food-ingredients-for-italian-pasta-illustration_24569533.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Overlay with noise texture */}
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-[2px]"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noiseFilter)"/%3E%3C/svg%3E")',
            opacity: '0.15',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 w-full">
          <HeroSection />
        </div>
      </div>

      {/* Rest of your sections... */}
    </OrderPageWrapper>
  );
}
