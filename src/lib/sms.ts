import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string): Promise<{ success: boolean; error?: string }> {
    try {
        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.warn("Twilio credentials missing. SMS not sent.");
            return { success: false, error: "Twilio credentials missing in server." };
        }

        let formattedTo = to.trim();
        // Remove non-digit characters except leading +
        formattedTo = formattedTo.replace(/[^\d+]/g, '');

        // Smart Prefix Logic:
        // 1. If no + at start, add +91 (India Default)
        if (!formattedTo.startsWith("+")) {
            formattedTo = "+91" + formattedTo;
        }
        // 2. If it starts with +1 (US) but has 11 digits (e.g., +19988116567), it's likely a mistake.
        if (formattedTo.startsWith("+1") && formattedTo.length > 11) {
            // Strip the +1 and add +91
            const rawNumber = formattedTo.substring(2);
            formattedTo = "+91" + rawNumber;
        }

        console.log(`Sending SMS to: ${formattedTo} from ${twilioPhoneNumber}`);

        const message = await client.messages.create({
            body: body,
            from: twilioPhoneNumber,
            to: formattedTo
        });

        console.log(`SMS Sent Successfully. SID: ${message.sid}`);
        return { success: true };
    } catch (error: any) {
        console.error("Twilio SMS Failed:", {
            message: error.message,
            code: error.code,
            status: error.status,
            moreInfo: error.moreInfo
        });

        // Twilio Auth Error (401 Unauthorized refers to 'Authenticate')
        if (error.status === 401 || error.message === "Authenticate") {
            return { success: false, error: "Twilio Auth Failed: Check Account SID & Auth Token in .env.local" };
        }

        // Return friendly error for common issues
        if (error.code === 21608) {
            return { success: false, error: "Twilio Error: Unverified Destination Number (Trial Account)." };
        }
        if (error.code === 21211) {
            return { success: false, error: "Twilio Error: Invalid Phone Number." };
        }
        if (error.code === 21408) {
            return { success: false, error: "Twilio Error: Permission to send SMS not enabled for region." };
        }

        return { success: false, error: error.message || "Twilio SMS Failed" };
    }
}
