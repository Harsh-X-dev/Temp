export default function SearchLoading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-4 animate-pulse">
      <div className="h-10 w-full rounded-full bg-[#ece7df] mb-6" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="flex flex-col gap-2">
            <div className="aspect-square w-full rounded-[12px] bg-[#ece7df]" />
            <div className="h-4 w-3/4 rounded bg-[#ece7df]" />
            <div className="h-4 w-1/2 rounded bg-[#ece7df]" />
          </div>
        ))}
      </div>
    </div>
  );
}
