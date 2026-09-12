import Image from "next/image";
import Link from "next/link";
import { getActiveCollections } from "@/services/collection.service";
import ClientLink from "@/components/ui/navigation/ClientLink";

export default async function CategoryGrid() {
  const categories = await getActiveCollections();

  // If there's an 'all' category or similar, we might filter it out if we just want specific ones.
  // The Figma shows specific categories: RUDRAKSHA, PYRITE, MALAS, BRACELETS.
  // Assuming the backend returns these. We will display up to 4.
  const displayCategories = categories.filter(c => c.id !== "all").slice(0, 4);

  return (
    <section aria-label="Shop By Category" className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 pt-2 sm:pt-4 px-4 md:px-6 lg:px-8">
        <h2 className="text-[18px] sm:text-[20px] font-bold text-text-primary tracking-tight">Shop by Category</h2>
        <ClientLink href="/collection/all" className="flex items-center gap-1 group">
          <span className="text-[13px] font-semibold text-primary-orange group-hover:underline">
            View all
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 text-primary-orange"
            aria-hidden="true"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </ClientLink>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 pb-6 px-4 sm:grid-cols-2 lg:grid-cols-4 md:px-6 lg:px-8">
        {displayCategories.map((cat) => (
          <ClientLink
            key={cat.id}
            href={`/collection/${cat.id}`}
            className="group relative flex h-[200px] w-full flex-col justify-between overflow-hidden rounded-[12px] bg-[#e5e0da] p-5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Underlying shimmer */}
            <div className="absolute inset-0 animate-shimmer" />

            {/* Background Image & Overlay */}
            {cat.icon && (
              <Image
                src={cat.icon}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
            <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />

            {/* Content (Title & Button) positioned at bottom */}
            <div className="relative z-10 mt-auto flex flex-col items-start gap-2">
              <h3 className="text-[24px] font-bold uppercase text-white drop-shadow-sm">
                {cat.label}
              </h3>
              <div className="flex items-center justify-center rounded-[20px] bg-white px-4 py-2">
                <span className="text-[12px] font-semibold text-text-primary">
                  Browse
                </span>
              </div>
            </div>
          </ClientLink>
        ))}
      </div>
    </section>
  );
}
