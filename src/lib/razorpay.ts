import Razorpay from 'razorpay';

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const initiateRefund = async (paymentId: string, amount: number) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
            amount: Math.round(amount * 100), // Razorpay expects paise
            speed: 'normal',
        });
        return refund;
    } catch (error) {
        console.error("Razorpay Refund Error:", error);
        throw error;
    }
};
