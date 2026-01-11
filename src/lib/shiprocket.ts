import { cookies } from "next/headers";

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL?.trim();
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD?.trim();

export async function getShiprocketToken() {
    // Check if we have a cached token (optional: implement redis/db cache for prod)
    // For now, we login every time or rely on simple in-memory if serverless instances persist, 
    // but logically better to just login. Shiprocket token is valid for 10 days.

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD,
        }),
    });

    if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error("Shiprocket Auth Failure:", {
            status: res.status,
            body: errorBody,
            email: SHIPROCKET_EMAIL?.slice(0, 3) + "****" // log partially for verification
        });
        throw new Error(`Failed to authenticate with Shiprocket: ${errorBody.message || res.statusText}`);
    }

    const data = await res.json();
    return data.token;
}

export async function checkServiceability(pincode: number, weight: number = 0.5) {
    const token = await getShiprocketToken();
    const pickup_postcode = 395007; // Surat, Gujarat

    // Delivery Postcode: User's pincode
    // Weight: in KG (0.5 = 500g)
    // COD: 1 (Yes) or 0 (No) - assume 0 for now as we use Razorpay

    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability?pickup_postcode=${pickup_postcode}&delivery_postcode=${pincode}&weight=${weight}&cod=0`;

    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!res.ok) {
        const err = await res.json();
        console.error("Shiprocket Serviceability Error:", err);
        throw new Error(err.message || "Serviceability check failed");
    }

    return await res.json();
}
