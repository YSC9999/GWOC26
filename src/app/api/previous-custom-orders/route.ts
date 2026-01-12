import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PreviousCustomOrder from '@/models/PreviousCustomOrder';

export async function GET() {
    try {
        await connectDB();
        const orders = await PreviousCustomOrder.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: orders });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
