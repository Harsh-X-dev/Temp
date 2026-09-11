"use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { useAuth } from "@/hooks/useAuth";
// import { createSupabaseBrowserClient } from "@/services/supabase/client";
// import { fetchCustomerOrders } from "@/services/orders.service";
// import type { OrderDetail } from "@/components/account/types";

// import CancelOrderHeader from "@/components/orders/headers/CancelOrderHeader";
// import OrderItemRow from "@/components/orders/OrderItemRow";
// import CancellationReasonList from "@/components/orders/CancellationReasonList";
// import RefundSummaryCard from "@/components/orders/cards/RefundSummaryCard";
// import { OrderHistorySkeleton } from "@/components/orders/states/OrderStates";
// import CancelSuccess from "@/components/orders/CancelSuccess";
// import Button from "@/components/ui/buttons/Button";

// export default function CancelOrderPage() {
//   const { orderNumber } = useParams<{ orderNumber: string }>();
//   const { isAuthenticated, loading, initialized } = useAuth();
//   const router = useRouter();

//   const [order, setOrder] = useState<OrderDetail | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const [selectedReason, setSelectedReason] = useState<string | null>(null);
//   const [otherReasonText, setOtherReasonText] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isCancelled, setIsCancelled] = useState(false);

//   useEffect(() => {
//     if (initialized && !loading && !isAuthenticated) {
//       router.replace(`/login?redirectTo=/orders/${orderNumber}/cancel`);
//     }
//   }, [initialized, loading, isAuthenticated, router, orderNumber]);

//   useEffect(() => {
//     async function loadOrder() {
//       if (!isAuthenticated) return;
//       try {
//         const supabase = createSupabaseBrowserClient();
//         const data = await fetchCustomerOrders(supabase);
        
//         const realOrder = data.find((o) => o.orderNumber === orderNumber);
        
//         if (realOrder) {
//           setOrder(realOrder);
//         } else {
//           setError("Order not found");
//         }
//       } catch (err: any) {
//         setError(err.message || "Failed to load order");
//       } finally {
//         setIsLoading(false);
//       }
//     }
//     loadOrder();
//   }, [isAuthenticated, orderNumber]);

//   const isSubmitDisabled = !selectedReason || (selectedReason === "Other" && !otherReasonText.trim());

//   const handleSubmit = async () => {
//     if (isSubmitDisabled) return;
//     setIsSubmitting(true);
    
//     const finalReason = selectedReason === "Other" ? otherReasonText.trim() : selectedReason;
    
//     try {
//       const supabase = createSupabaseBrowserClient();
//       const { cancelOrder } = await import("@/services/orders.service");
//       await cancelOrder(supabase, orderNumber as string, finalReason || "Other");
//       setIsCancelled(true);
//     } catch (err: any) {
//       alert(err.message || "Failed to cancel order.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!initialized || loading || (isAuthenticated && isLoading)) {
//     return (
//       <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col">
//         <CancelOrderHeader orderNumber={orderNumber as string} />
//         <div className="flex-1 lg:py-8 max-w-7xl mx-auto w-full pt-6 px-[16px] md:px-8">
//           <OrderHistorySkeleton />
//         </div>
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col">
//         <CancelOrderHeader orderNumber={orderNumber as string} />
//         <div className="flex-1 flex items-center justify-center py-16">
//           <div className="text-center">
//             <h2 className="text-lg font-bold text-text-primary">Order Not Found</h2>
//             <p className="mt-2 text-sm text-text-secondary">{error}</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const finalReason = selectedReason === "Other" ? otherReasonText.trim() : selectedReason;

//   if (isCancelled) {
//     return <CancelSuccess order={order} reason={finalReason || "Other"} />;
//   }

//   return (
//     <div className="bg-[#FDFBF7] md:bg-white min-h-[100dvh] flex flex-col relative pb-[100px]">
//       <CancelOrderHeader orderNumber={orderNumber as string} />
      
//       <div className="flex-1 lg:py-8 max-w-7xl mx-auto w-full pt-4 lg:pt-0 px-[16px] md:px-8">
        
//         {/* Order Item Card (Showing whole order items) */}
//         <div className="rounded-xl border border-border-strong bg-white p-4 md:p-5 mx-4 lg:mx-0 mb-6">
//           <div className="flex flex-col divide-y divide-border-light">
//             {order.items.map((item) => (
//               <OrderItemRow key={item.id} item={item} status={order.status} />
//             ))}
//           </div>
//           <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
//             <svg className="size-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//             </svg>
//             Order #{order.orderNumber}
//           </div>
//         </div>

//         <CancellationReasonList 
//           selectedReason={selectedReason} 
//           onSelect={setSelectedReason} 
//           otherReasonText={otherReasonText}
//           onOtherReasonChange={setOtherReasonText}
//         />

//         <RefundSummaryCard order={order} />

//       </div>

//       {/* Sticky footer for submit */}
//       <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-strong p-4 pb-safe lg:static lg:bg-transparent lg:border-none lg:mt-6 lg:max-w-7xl lg:mx-auto lg:p-0 px-[16px] md:px-8">
//         <Button
//           variant="filled"
//           size="lg"
//           disabled={isSubmitDisabled || isSubmitting}
//           onClick={handleSubmit}
//           className="h-12 w-full rounded-full font-bold"
//         >
//           {isSubmitting ? "Submitting..." : "Submit Cancellation"}
//         </Button>
//       </div>
//     </div>
//   );
// }



import { useParams, useRouter } from "next/navigation";
export default function CancelOrderPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const router = useRouter();


return (
    <div className="min-h-[100dvh] bg-[#FDFBF7] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-[#e5e0da] bg-white">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex size-9 items-center justify-center rounded-full border border-[#e5e0da] text-[#211e1a] hover:bg-[#f5f3f0] transition-colors cursor-pointer shrink-0"
          aria-label="Go back"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="font-['Montserrat',sans-serif] font-bold text-[16px] text-[#211e1a]">
          Cancel Order
        </h1>
      </div>
      {/* Coming Soon Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
        {/* Icon */}
        <div className="size-20 rounded-full bg-orange-50 border-2 border-[#ff5400]/20 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#ff5400]">
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 11a1 1 0 01-1-1V7a1 1 0 112 0v5a1 1 0 01-1 1zm0 4a1.25 1.25 0 110-2.5A1.25 1.25 0 0112 17z"
              fill="currentColor"
            />
          </svg>
        </div>
        {/* Text */}
        <div className="flex flex-col gap-2">
          <h2 className="font-['Montserrat',sans-serif] font-bold text-[20px] text-[#211e1a]">
            Coming Soon
          </h2>
          <p className="font-['Montserrat',sans-serif] font-normal text-[13px] text-[#6b6459] leading-relaxed max-w-[260px]">
            Order cancellation will be available very soon. Please contact support if you need help right now.
          </p>
        </div>
        {/* Order number badge */}
        <span className="inline-flex items-center gap-1.5 bg-white border border-[#e5e0da] rounded-full px-4 py-2 text-[12px] font-['Montserrat',sans-serif] font-semibold text-[#6b6459]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Order #{orderNumber}
        </span>
        {/* Back button */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-2 h-[44px] px-8 rounded-full bg-[#ff5400] text-white font-['Montserrat',sans-serif] font-semibold text-[14px] hover:bg-[#e64c00] active:scale-[0.98] transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

