import React from "react";

export default function AnnouncementBar() {
  return (
    <div
      id="announcement-bar"
      className="bg-primary-orange flex h-[32px] w-full max-w-full items-center justify-center px-4 shrink-0 overflow-hidden"
    >
      <p className="font-semibold text-[10px] sm:text-xs text-center text-white uppercase tracking-wider truncate sm:whitespace-normal">
        FREE SHIPPING ABOVE Rs999 &bull; AUTHENTICITY CERTIFIED
      </p>
    </div>
  );
}
