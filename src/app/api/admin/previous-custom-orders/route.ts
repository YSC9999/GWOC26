import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import PreviousCustomOrder from '@/models/PreviousCustomOrder';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { images, description } = body;

        if (!images || !description) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const newOrder = new PreviousCustomOrder({
            images,
            description
        });

        await newOrder.save();

        return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
        }

        await PreviousCustomOrder.findByIdAndDelete(id);

        return NextResponse.json({ success: true, message: 'Deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
