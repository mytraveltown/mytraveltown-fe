import { POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { BookingInterface } from "@/lib/interface";

interface BalanceOrderResponse {
  data: {
    order: { id: string; amount: number };
    booking: BookingInterface;
    key: string;
  };
}

interface BalancePaymentCallbacks {
  onPaid: () => void;
  onError: (message: string) => void;
}

const errorMessage = (err: unknown, fallback: string) =>
  err && typeof err === "object" && "message" in err
    ? String((err as { message: string }).message)
    : fallback;

/** Opens Razorpay to pay the remaining balance of a booking via the platform. */
export async function payBalanceOnline(
  encryptedBookingId: string,
  { onPaid, onError }: BalancePaymentCallbacks
) {
  try {
    const { data } = await POST<BalanceOrderResponse>(
      API.BOOKING.BALANCE_ORDER(encryptedBookingId)
    );
    const { order, booking, key } = data;

    const razorpay = new (window as any).Razorpay({
      key,
      amount: order.amount,
      currency: "INR",
      name: "MyTravelTown",
      description: `Balance payment - ${booking.package_name ?? `Booking #${booking.id}`}`,
      order_id: order.id,
      handler: async (response: any) => {
        try {
          await POST(API.BOOKING.VERIFY_BALANCE, {
            booking_id: booking.id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          onPaid();
        } catch (err) {
          onError(errorMessage(err, "Balance payment could not be verified."));
        }
      },
      prefill: { name: booking.name, email: booking.email, contact: booking.phone },
      theme: { color: "#0d6efd" },
    });
    razorpay.open();
  } catch (err) {
    onError(errorMessage(err, "Could not start balance payment."));
  }
}
