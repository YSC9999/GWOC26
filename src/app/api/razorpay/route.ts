import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const { amount, currency } = await req.json();

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
  amount: Math.round(amount * 100),
  currency: "INR",
  receipt: `receipt_${Date.now()}`,
  payment_capture: true,
  notes: {
    payment_method: "upi", // custom note
  }
});



    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
  console.error("Razorpay order error:", error);
  return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
