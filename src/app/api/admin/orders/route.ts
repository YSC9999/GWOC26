import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import { requireAdmin } from "@/lib/admin-guard";
import { initiateRefund } from "@/lib/razorpay";
import { sendRefundEmail, sendWalletCreditEmail, sendCancellationEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')
      .populate('items.productId', 'tags')
      .lean();
    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { id, status, trackingNumber, adminNotes } = await req.json();

    if (!id) return NextResponse.json({ error: "Order id required" }, { status: 400 });

    const update: any = {};
    if (status) update.status = status;
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const order = await Order.findByIdAndUpdate(
      id,
      update,
      { new: true }
    ).populate('userId', 'name email');

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    await connectDB();
    const { action, orderId, itemId, amount } = await req.json();

    const order = await Order.findById(orderId).populate('userId');
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    let refundAmount = 0;
    let refundSource = "";

    if (action === 'cancel_order') {
      // Full Refund
      if (order.status === 'cancelled') return NextResponse.json({ error: "Already cancelled" }, { status: 400 });

      refundAmount = order.total;
      order.status = 'cancelled';
      order.paymentStatus = 'refunded';

      // Mark all items as cancelled
      order.items.forEach((item: any) => item.status = 'cancelled');

    } else if (action === 'cancel_item' && itemId) {
      // Partial Refund
      const itemIndex = order.items.findIndex((i: any) => (i._id && i._id.toString() === itemId) || (i.productId && i.productId.toString() === itemId));
      if (itemIndex === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

      const item = order.items[itemIndex];
      if (item.status === 'cancelled') return NextResponse.json({ error: "Item already cancelled" }, { status: 400 });

      refundAmount = item.price * item.quantity;
      item.status = 'cancelled';

      // Check if all items are cancelled now
      const allCancelled = order.items.every((i: any) => i.status === 'cancelled');
      if (allCancelled) {
        order.status = 'cancelled';
        order.paymentStatus = 'refunded';
      }
    } else {
      return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
    }

    // --- PROCESS REFUND ---
    if (refundAmount > 0) {
      try {
        if (order.paymentMethod === 'razorpay' && order.razorpayPaymentId) {
          // Try Razorpay Refund
          await initiateRefund(order.razorpayPaymentId, refundAmount);
          refundSource = "Original Payment Method (Razorpay)";
        } else {
          if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
            refundAmount = 0; // No refund for unpaid COD
          } else {
            // Refund to Wallet
            if (order.userId) {
              // @ts-ignore
              const user = await User.findById(order.userId._id || order.userId);
              if (user) {
                user.walletBalance = (user.walletBalance || 0) + refundAmount;
                await user.save();
                refundSource = "Basho Wallet";
                await sendWalletCreditEmail(user.email, refundAmount, user.walletBalance, `Refund for Order #${order.orderNumber}`);
              }
            }
          }
        }
      } catch (err) {
        console.error("Refund Logic Failed", err);
        order.adminNotes = (order.adminNotes || "") + `\n[System]: Auto-refund of ₹${refundAmount} FAILED. Manual check required.`;
      }
    }

    await order.save();

    // --- SEND NOTIFICATION (Background) ---
    // We do not await this to speed up the UI response
    (async () => {
      try {
        // @ts-ignore
        const email = order.userId?.email || order.email;

        if (email) {
          if (refundAmount > 0) {
            await sendRefundEmail(email, refundAmount, order.orderNumber, refundSource);
          } else {
            // If no refund (e.g. Unpaid COD), still send cancellation email
            await sendCancellationEmail(email, order.orderNumber);
          }
        }
      } catch (emailErr) {
        console.error("Background Email Failed:", emailErr);
      }
    })();

    return NextResponse.json({ success: true, order });

  } catch (error: any) {
    console.error("Order Action Failed:", error);
    return NextResponse.json({ error: error.message || "Action failed" }, { status: 500 });
  }
}