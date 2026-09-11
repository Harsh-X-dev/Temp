import { getHomeTestimonials } from "@/services/testimonial.service";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";

// We'll use a simple CSS snap scroll for the testimonials carousel
export default async function TestimonialsSection() {
  const rawTestimonials = await getHomeTestimonials();

  // Strict condition: only show reviews with a 5-star rating and attached image
  const testimonials = (rawTestimonials || []).filter(
    (item) =>
      item &&
      Number(item.rating) === 5 &&
      typeof item.imageUrl === "string" &&
      item.imageUrl.trim().length > 0
  );

  if (testimonials.length === 0) return null;

  return (
    <section aria-labelledby="testimonials-heading" className="w-full bg-transparent pb-2 overflow-hidden">
      <div className="flex items-center justify-start pb-3 px-4 md:px-6 lg:px-8 max-w-[1920px] mx-auto w-full">
        <h2 id="testimonials-heading" className="text-[20px] font-bold text-text-primary">
          What are they saying?
        </h2>
      </div>
      <TestimonialCarousel testimonials={testimonials} />
    </section>
  );
}
