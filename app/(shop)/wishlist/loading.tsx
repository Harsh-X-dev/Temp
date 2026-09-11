export default function WishlistLoading() {
  return (
    <div className="bg-[#fbf8f4] flex flex-col w-full max-w-7xl mx-auto md:px-8 flex-1 h-full pb-10">
      {/* Header Bar matching Wishlist page */}
      <div className="bg-white border-b border-[#e5e0da] flex h-[56px] shrink-0 items-center justify-between px-6 md:px-0 w-full">
        <h1 className="font-bold text-[#211e1a] text-[18px]">Wishlist</h1>
      </div>

      {/* List items skeleton matching Wishlist list cards */}
      <div className="flex flex-col w-full px-[16px] md:px-0 gap-4 pt-4">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex gap-3 w-full animate-pulse bg-white md:bg-transparent p-3 rounded-[12px] md:p-0">
            <div className="w-[100px] h-[100px] bg-[#ece7df] rounded-[12px] shrink-0" />
            <div className="flex flex-col flex-1 py-1 gap-2">
              <div className="h-4 bg-[#ece7df] rounded w-3/4" />
              <div className="h-3 bg-[#ece7df] rounded w-1/4" />
              <div className="flex items-center justify-between mt-auto">
                <div className="h-4 bg-[#ece7df] rounded w-20" />
                <div className="h-7 bg-[#ece7df] rounded-full w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
