import type { OrderTrackingEvent } from "@/components/account/types";
import TrackingTimelineItem from "@/components/orders/timeline/TrackingTimelineItem";

interface OrderTrackingTimelineProps {
  events: OrderTrackingEvent[];
}

export default function OrderTrackingTimeline({ events }: OrderTrackingTimelineProps) {
  if (!events || events.length === 0) return null;

  return (
    <div className="rounded-xl border border-[#E5E0DA] bg-white p-5 lg:mx-0">
      <h2 className="text-[15px] font-bold text-[#211E1A] mb-6">Tracking Status</h2>
      <div className="flex flex-col">
        {events.map((event, index) => (
          <TrackingTimelineItem 
            key={index} 
            event={event} 
            isLast={index === events.length - 1} 
          />
        ))}
      </div>
    </div>
  );
}
