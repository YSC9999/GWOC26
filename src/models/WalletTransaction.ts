import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWalletTransaction extends Document {
    user: mongoose.Types.ObjectId;
    amount: number;
    type: "credit" | "debit";
    description: string;
    createdAt: Date;
}

const WalletTransactionSchema = new Schema<IWalletTransaction>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        amount: { type: Number, required: true },
        type: { type: String, enum: ["credit", "debit"], required: true },
        description: { type: String, required: true },
    },
    { timestamps: true }
);

const WalletTransaction: Model<IWalletTransaction> =
    mongoose.models.WalletTransaction || mongoose.model<IWalletTransaction>("WalletTransaction", WalletTransactionSchema);

export default WalletTransaction;
