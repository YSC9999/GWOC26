import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";
import { requireAdmin } from "@/lib/admin-guard";
import { initiateRefund } from "@/lib/razorpay";
import { sendRefundEmail, sendWalletCreditEmail, sendCancellationEmail, sendOrderStatusEmail } from "@/lib/email";

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

    if (status && ['confirmed', 'shipped', 'delivered'].includes(status)) {
      // @ts-ignore
      const email = order.userId?.email || order.email;
      if (email) {
        // Send email in background
        (async () => {
          await sendOrderStatusEmail(email, order.orderNumber, status, trackingNumber);
        })();
      }
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Order Update Error:", error);
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
      // @ts-ignore
      order.items.forEach((item: any) => item.status = 'cancelled');

    } else if (action === 'cancel_item') {
      // Partial Cancellation
      if (!itemId) return NextResponse.json({ error: "Item ID required" }, { status: 400 });

      // @ts-ignore
      const item = order.items.find((i: any) => i._id.toString() === itemId);
      if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
      if (item.status === 'cancelled') return NextResponse.json({ error: "Item already cancelled" }, { status: 400 });

      // Calculate Shipping Refund
      const productIds = order.items.map((i: any) => i.productId || i._id);
      const products = await Product.find({ _id: { $in: productIds } });

      // Calculate NEW weight (excluding the cancelled item)
      let newWeight = 0;
      // @ts-ignore
      order.items.forEach((i: any) => {
        if (i._id.toString() !== itemId && i.status !== 'cancelled') {
          // Find product for this item to get its weight
          // Support both populated and unpopulated productId
          const pId = i.productId?._id?.toString() || i.productId?.toString();
          const p = products.find((prod: any) => prod._id.toString() === pId);

          // Default to 500g if not found or no weight specified
          const w = (p?.weightGrams || 500) / 1000;
          newWeight += w * i.quantity;
        }
      });

      // Import ShippingRate dynamically
      const ShippingRate = (await import("@/models/ShippingRate")).default;

      let newShippingCost = 150; // Default base cost
      const matchingRate = await ShippingRate.findOne({
        minWeight: { $lte: newWeight },
        maxWeight: { $gte: newWeight }
      }).sort({ rate: 1 });

      if (matchingRate) {
        newShippingCost = matchingRate.rate;
      } else {
        const maxRate = await ShippingRate.findOne({}).sort({ maxWeight: -1 });
        if (maxRate && newWeight > maxRate.maxWeight) {
          // Add 50 for every kg above max
          newShippingCost = maxRate.rate + Math.ceil(newWeight - maxRate.maxWeight) * 50;
        }
      }

      // If new weight is 0 (all remaining items are cancelled), shipping is 0
      // @ts-ignore
      const workingItems = order.items.filter((i: any) => i._id.toString() !== itemId && i.status !== 'cancelled');
      if (workingItems.length === 0) {
        newShippingCost = 0;
      }

      const shippingDiff = Math.max(0, order.shippingCost - newShippingCost);
      const itemTotal = item.price * item.quantity;

      refundAmount = itemTotal + shippingDiff;

      // Update Order Totals
      order.shippingCost = newShippingCost;
      order.total = Math.max(0, order.total - refundAmount);

      item.status = 'cancelled';

      // Check if all items are cancelled now
      // @ts-ignore
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
            // Wallet Refund Disabled as per request
            // if (order.userId) { ... }
            refundSource = "Manual Refund Required (Wallet Disabled)";
            order.adminNotes = (order.adminNotes || "") + `\n[System]: Refund of ₹${refundAmount} due. Wallet disabled. Please refund manually.`;
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