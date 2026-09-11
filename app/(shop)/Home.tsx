import BannerCarousel from "@/components/home/banners/BannerCarousel";
import CategoryGrid from "@/components/home/CategoryGrid";
import BestsellersSection from "@/components/home/sections/BestsellersSection";
import SplitStoryBanner from "@/components/home/banners/SplitStoryBanner";
import TwoUpStoryGrid from "@/components/home/banners/TwoUpStoryGrid";
import TestimonialsSection from "@/components/home/sections/TestimonialsSection";
import TrustBanner from "@/components/home/banners/TrustBanner";
import GetInTouch from "@/components/home/sections/GetInTouch";

/**
 * Home page content component.
 * Navbar and BottomNav are provided by app/(shop)/layout.tsx — not rendered here.
 */
export default function Home() {
  return (
    <div className="flex w-full max-w-full min-w-0 flex-col overflow-x-hidden bg-surface-subtle">
      {/* 1. Hero Carousel — Full width per design */}
      <div className="mx-auto w-full max-w-[1920px] min-w-0">
        <BannerCarousel />
      </div>

      {/* 2. Shop by Category */}
      <div className="mx-auto mt-6 w-full max-w-[1920px] min-w-0">
        <CategoryGrid />
      </div>

      {/* 3. Bestsellers Section */}
      <div className="mx-auto mt-6 w-full max-w-[1920px] min-w-0 overflow-hidden">
        <BestsellersSection />
      </div>

      {/* 4. Split Story Banner */}
      <div className="mx-auto mt-4 w-full max-w-[1920px] min-w-0">
        <SplitStoryBanner />
      </div>

      {/* 5. Two-up Story Grid */}
      <div className="mx-auto mt-8 w-full max-w-[1920px] min-w-0">
        <TwoUpStoryGrid />
      </div>

      {/* 6. Testimonials Section */}
      <div className="mx-auto mt-8 w-full max-w-[1920px] min-w-0 overflow-hidden">
        <TestimonialsSection />
      </div>

      {/* 7. Trust Banner */}
      <div className="mx-auto w-full max-w-[1920px] min-w-0">
        <TrustBanner />
      </div>

      {/* 8. Get in Touch */}
      <div className="mx-auto w-full max-w-[1920px] min-w-0">
        <GetInTouch />
      </div>
    </div>
  );
}
