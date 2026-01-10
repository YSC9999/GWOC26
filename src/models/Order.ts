import mongoose, { Document, Model, Schema } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weightGrams: number;
}

export interface IShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId?: mongoose.Types.ObjectId;
  email: string;
  items: IOrderItem[];
  subtotal: number;
  gstAmount: number;
  shippingCost: number;
  discount: number;
  total: number;
  customerGstNumber?: string;
  wantsInvoice: boolean;
  shippingAddress: IShippingAddress;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  emailSent: boolean;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number,
  image: String,
  weightGrams: Number
}, { _id: false });

const ShippingAddressSchema = new Schema({
  name: String,
  phone: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' }
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: String,
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  gstAmount: { type: Number, default: 0 },
  shippingCost: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  customerGstNumber: String,
  wantsInvoice: { type: Boolean, default: false },
  shippingAddress: ShippingAddressSchema,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  trackingNumber: String,
  emailSent: { type: Boolean, default: false },
  customerNotes: String,
  adminNotes: String,
}, { timestamps: true });

// Generate order number before saving
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    try {
      // Use the model available in mongoose.models if 'this.constructor' is not reliable
      const count = await mongoose.models.Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      });
      this.orderNumber = `BASHO-${dateStr}-${String(count + 1).padStart(3, '0')}`;
    } catch (e) {
      // Fallback random if count fails (e.g., during seed)
      this.orderNumber = `BASHO-${dateStr}-${Math.floor(Math.random() * 1000)}`;
    }
  }
  next();
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export default Order;
