export default function WishlistLoading() {
  return (
    <div className="bg-[#FAF5EF] flex flex-col w-full flex-1 min-h-[calc(100dvh-120px)] items-center justify-center">
      {/* Centered Loading Animation matching Figma node 1482:1031 */}
      <div className="flex flex-col items-center justify-center gap-3">
        {/* 3 pulsing dots */}
        <div className="flex items-center gap-2">
          <span className="size-2 sm:size-2.5 rounded-full bg-[#D5CFC5] animate-bounce [animation-delay:-0.3s]" />
          <span className="size-2 sm:size-2.5 rounded-full bg-[#D5CFC5] animate-bounce [animation-delay:-0.15s]" />
          <span className="size-2 sm:size-2.5 rounded-full bg-[#D5CFC5] animate-bounce" />
        </div>

        {/* Small rounded base pill */}
        <div className="h-2 w-14 sm:w-16 rounded-full bg-[#EAE3D8] animate-pulse" />
      </div>
    </div>
  );
}
