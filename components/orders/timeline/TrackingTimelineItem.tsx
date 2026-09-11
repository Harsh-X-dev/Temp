import type { OrderTrackingEvent } from "@/components/account/types";

interface TrackingTimelineItemProps {
  event: OrderTrackingEvent;
  isLast: boolean;
}

export default function TrackingTimelineItem({ event, isLast }: TrackingTimelineItemProps) {
  const isCompleted = event.status === "completed";
  const isCurrent = event.status === "current";
  const isPending = event.status === "pending";

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      {!isLast && (
        <div 
          className={`absolute left-[11px] top-6 w-[2px] -bottom-2 ${
            isCompleted || isCurrent ? "bg-[#FF6B00]" : "bg-transparent border-l-[2px] border-dashed border-[#E5E0DA]"
          }`}
          style={isPending ? { borderLeftStyle: 'dashed' } : undefined}
        />
      )}

      {/* Timeline Dot */}
      <div className="relative z-10 flex flex-col items-center justify-start shrink-0">
        <div 
          className={`flex size-6 items-center justify-center rounded-full ${
            isCompleted 
              ? "bg-[#FF6B00]" 
              : isCurrent 
                ? "bg-white border-[2px] border-[#FF6B00]" 
                : "bg-white border-[2px] border-[#E5E0DA]"
          }`}
        >
          {isCompleted ? (
            <svg className="size-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : isCurrent ? (
            <div className="size-2 rounded-full bg-[#FF6B00]" />
          ) : null}
        </div>
      </div>

      {/* Timeline Content */}
      <div className="pb-8 -mt-0.5">
        <h3 className={`text-[13px] font-bold ${isPending ? "text-[#A69C8E]" : isCurrent ? "text-[#FF6B00]" : "text-[#211E1A]"}`}>
          {event.title}
        </h3>
        {event.timestamp && (
          <p className="mt-0.5 text-xs text-[#A69C8E]">{event.timestamp}</p>
        )}
        {(event.description || event.trackingNumber) && (
          <div className={`mt-1 text-[11px] leading-relaxed whitespace-nowrap ${isPending ? "text-[#A69C8E]" : "text-[#6B6459]"}`}>
            {event.description && <span>{event.description}</span>}
            {event.trackingNumber && (
              <>
                {' | Tracking No: '}
                <span>{event.trackingNumber}</span>
              </>
            )}
          </div>
        )}
        {event.trackingUrl && (
          <div className="mt-2">
            <a
              href={event.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-1.5 text-xs font-bold text-[#FF6B00] border border-[#FF6B00] rounded-full hover:bg-[#FFF6ED] transition-colors"
            >
              Track Package
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
