import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, body: string) {
    try {
        console.log("Twilio Config Check:", {
            hasSid: !!accountSid,
            hasToken: !!authToken,
            hasPhone: !!twilioPhoneNumber
        });

        if (!accountSid || !authToken || !twilioPhoneNumber) {
            console.warn("Twilio credentials missing. SMS not sent.");
            return false;
        }

        // Ensure number has country code. Default to +91 if missing
        let formattedTo = to.trim();
        if (!formattedTo.startsWith("+")) {
            formattedTo = "+91" + formattedTo;
        }

        const message = await client.messages.create({
            body: body,
            from: twilioPhoneNumber,
            to: formattedTo
        });

        console.log(`SMS Sent: ${message.sid}`);
        return true;
    } catch (error) {
        console.error("Twilio SMS Error:", error);
        return false;
    }
}
