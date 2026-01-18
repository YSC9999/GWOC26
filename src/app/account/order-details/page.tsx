"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function OrderDetailsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get("id");

    useEffect(() => {
        if (orderId) {
            // Redirect to the orders list with the specific ID to trigger the modal
            router.replace(`/account/orders?id=${orderId}`);
        } else {
            router.replace("/account/orders");
        }
    }, [orderId, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-sand/10">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-clay mx-auto mb-4" />
                <p className="text-soil font-medium">Fetching order details...</p>
            </div>
        </div>
    );
}

export default function OrderDetailsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-sand/10">
                <Loader2 className="w-10 h-10 animate-spin text-clay" />
            </div>
        }>
            <OrderDetailsContent />
        </Suspense>
    );
}
