import { SupabaseClient } from "@supabase/supabase-js";
import type { OrderDetail, OrderStatus, OrderTrackingEvent } from "@/components/account/types";

// Helper to generate tracking events based on order status
function generateTrackingEvents(
  status: OrderStatus, 
  placedAt: string, 
  trackingNumber?: string | null, 
  trackingUrl?: string | null,
  deliveredAt?: string | null,
  confirmedAt?: string | null,
  shippedAt?: string | null,
  outForDeliveryAt?: string | null
): OrderTrackingEvent[] {
  const events: OrderTrackingEvent[] = [
    { title: "Order Placed", timestamp: new Date(placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), status: "completed" },
  ];

  if (status === "cancelled") {
    events.push({ title: "Cancelled", timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), status: "current", description: "Order was cancelled" });
    return events;
  }
  
  if (status === "returned" || status === "refunded") {
    events.push({ title: "Confirmed", timestamp: confirmedAt ? new Date(confirmedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, status: "completed" });
    events.push({ title: "Shipped", timestamp: shippedAt ? new Date(shippedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, status: "completed" });
    events.push({ title: "Delivered", timestamp: deliveredAt ? new Date(deliveredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, status: "completed" });
    events.push({ title: status === "returned" ? "Returned" : "Refunded", timestamp: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }), status: "current" });
    return events;
  }

  // Normal flow
  const isConfirmed = ["confirmed", "processing", "shipped", "out_for_delivery", "delivered"].includes(status);
  const isShipped = ["shipped", "out_for_delivery", "delivered"].includes(status);
  const isOut = ["out_for_delivery", "delivered"].includes(status);
  const isDelivered = status === "delivered";

  // Formulate description for shipped
  let shippedDesc = undefined;
  if (isShipped && trackingNumber) {
    // Attempting to mock Courier as BlueDart if tracking number exists as per Figma
    // Or we could just use a generic 'Courier' label
    shippedDesc = `Courier: BlueDart`;
  }

  // Calculate estimated delivery
  let deliveredDesc = "Pending";
  if (!isDelivered) {
    const estimatedDate = new Date(placedAt);
    estimatedDate.setDate(estimatedDate.getDate() + 4);
    deliveredDesc = `Estimated Delivery: ${estimatedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`;
  } else if (deliveredAt) {
    // Do not show estimated delivery if already delivered, timestamp takes over
    deliveredDesc = ""; 
  }

  events.push({ 
    title: "Order Confirmed", 
    timestamp: isConfirmed && confirmedAt ? new Date(confirmedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, 
    status: isConfirmed ? "completed" : "pending" 
  });
  
  events.push({ 
    title: "Shipped", 
    timestamp: isShipped && shippedAt ? new Date(shippedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, 
    status: isShipped ? (status === "shipped" ? "current" : "completed") : "pending",
    description: shippedDesc,
    trackingNumber: trackingNumber || null,
    trackingUrl: trackingUrl || null
  });
  
  events.push({ 
    title: "Out for Delivery", 
    timestamp: isOut && outForDeliveryAt ? new Date(outForDeliveryAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, 
    status: isOut ? (status === "out_for_delivery" ? "current" : "completed") : "pending",
    description: !isOut ? "Pending" : undefined
  });
  
  events.push({ 
    title: "Delivered", 
    timestamp: isDelivered && deliveredAt ? new Date(deliveredAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : null, 
    status: isDelivered ? "current" : "pending",
    description: deliveredDesc || undefined
  });

  // Adjust "current" status if needed
  if (status === "pending") events[0].status = "current";
  if (status === "confirmed" || status === "processing") events[1].status = "current";

  return events;
}

function formatOrderRow(o: any): OrderDetail {
  let deliveryAddress = null;
  if (o.shipping_address) {
    const addr = Array.isArray(o.shipping_address) ? o.shipping_address[0] : o.shipping_address;
    if (addr) {
      const parsedAddr = typeof addr === 'string' ? JSON.parse(addr) : addr;
      const details = parsedAddr || {};
      const parts = [];
      if (details.line1) parts.push(details.line1);
      if (details.line2) parts.push(details.line2);

      const cty = details.city || "";
      const st = details.state || "";
      const pin = details.pincode || "";
      if (cty || st || pin) {
        let lastLine = `${cty}`;
        if (st) lastLine += (lastLine ? `, ${st}` : st);
        if (pin) lastLine += (lastLine ? ` - ${pin}` : pin);
        parts.push(lastLine);
      }

      deliveryAddress = {
        fullName: details.full_name || "Customer",
        fullAddress: parts.join('\n'),
      };
    }
  }

  const paymentInfo = typeof o.payment_info === 'string' ? JSON.parse(o.payment_info) : (o.payment_info || {});
  const productInfo = typeof o.product_info === 'string' ? JSON.parse(o.product_info) : (o.product_info || []);

  const isCod = (
    o.payment_method?.toLowerCase() === 'cod' ||
    paymentInfo.payment_method?.toLowerCase() === 'cod' ||
    o.notes?.toLowerCase()?.includes('cash on delivery')
  );

  const rawSubtotal = parseFloat(paymentInfo.subtotal || "0");
  const rawShipping = parseFloat(paymentInfo.shipping_amount || "0");
  const rawDiscount = parseFloat(paymentInfo.discount_amount || "0");
  const rawTaxes = parseFloat(paymentInfo.tax_amount || "0");
  const rawTotal = parseFloat(paymentInfo.total || "0");

  const codFee = isCod ? (paymentInfo.cod_charges !== undefined ? parseFloat(paymentInfo.cod_charges) : 50) : 0;

  let finalTotal = rawTotal;
  if (isCod) {
    const withoutCod = rawSubtotal + rawShipping + rawTaxes - rawDiscount;
    if (rawTotal <= withoutCod + 1) {
      finalTotal = rawTotal + codFee;
    }
  }

  let fallbackUnitPrice = 0;
  if (productInfo.length > 0) {
    const subtotal = rawSubtotal;
    const totalQuantity = productInfo.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    fallbackUnitPrice = totalQuantity > 0 ? subtotal / totalQuantity : 0;
  }

  return {
    id: o.id,
    orderNumber: o.order_number,
    status: o.status as OrderStatus,
    total: finalTotal,
    placedAt: o.placed_at,
    items: productInfo.map((item: any) => {
      const parsedUnitPrice = item.unit_price ? parseFloat(item.unit_price) : null;

      return {
        id: item.id || Math.random().toString(),
        productId: item.product_id,
        productSlug: null,
        productTitle: item.product_title,
        variantTitle: item.variant_title ? item.variant_title.replace(/\s*\/\s*/g, ', ') : null,
        quantity: item.quantity,
        unitPrice: parsedUnitPrice !== null ? parsedUnitPrice : fallbackUnitPrice,
        imageUrl: item.image_url || null,
      };
    }),
    trackingEvents: generateTrackingEvents(
      o.status as OrderStatus,
      o.placed_at,
      o.tracking_number,
      o.tracking_url,
      o.delivered_at,
      o.confirmed_at,
      o.shipped_at,
      o.out_for_delivery_at
    ),
    deliveryAddress,
    trackingNumber: o.tracking_number,
    trackingUrl: o.tracking_url,
    confirmedAt: o.confirmed_at,
    shippedAt: o.shipped_at,
    outForDeliveryAt: o.out_for_delivery_at,
    deliveredAt: o.delivered_at,
    paymentSummary: {
      subtotal: rawSubtotal,
      shipping: rawShipping,
      discountApplied: rawDiscount,
      gst: rawTaxes,
      codFee: codFee,
      paymentMethod: isCod ? 'cod' : 'prepaid',
      totalPaid: finalTotal,
    },
  };
}

export async function fetchCustomerOrders(
  supabase: SupabaseClient,
  userId?: string,
): Promise<OrderDetail[]> {
  let targetUserId = userId;
  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    throw new Error("Must be authenticated to fetch orders.");
  }

  // 1. Fetch orders
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      placed_at,
      tracking_number,
      tracking_url,
      confirmed_at,
      shipped_at,
      out_for_delivery_at,
      delivered_at,
      shipping_address,
      payment_info,
      product_info
    `)
    .eq("user_id", targetUserId)
    .neq("status", "pending")
    .order("placed_at", { ascending: false });

  if (ordersError) {
    throw new Error(ordersError.message ?? "Failed to fetch orders");
  }

  return (ordersData || []).map(formatOrderRow);
}

export async function fetchSingleOrder(
  supabase: SupabaseClient,
  orderNumber: string,
  userId?: string,
): Promise<OrderDetail | null> {
  let query = supabase
    .from("orders")
    .select(`
      id,
      order_number,
      status,
      placed_at,
      tracking_number,
      tracking_url,
      confirmed_at,
      shipped_at,
      out_for_delivery_at,
      delivered_at,
      shipping_address,
      payment_info,
      product_info
    `)
    .eq("order_number", orderNumber);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) {
    return null;
  }

  return formatOrderRow(data);
}

export async function cancelOrder(
  supabase: SupabaseClient,
  orderNumber: string,
  reason: string
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be authenticated to cancel an order.");
  }

  // Update order status and append cancellation reason or create an event.
  // Assuming there's a simple status update on 'orders' table
  const { error } = await supabase
    .from("orders")
    .update({ 
      status: "cancelled",
      // cancel_reason: reason // Optionally, if the schema supports a cancellation reason
    })
    .eq("order_number", orderNumber)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message ?? "Failed to cancel order.");
  }
}
