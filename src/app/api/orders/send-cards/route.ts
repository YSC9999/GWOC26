import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // If email credentials are not configured, log to console
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("📧 EMAIL SERVICE NOT CONFIGURED - DEVELOPMENT MODE");
      console.log(`Would send care cards to: ${email}`);
      return NextResponse.json({ success: true, message: "Development mode - email not sent" });
    }

    // Read image files for CID attachment
    const thankYouPath = path.join(process.cwd(), "public", "thank-you-detailed.jpeg");
    const carePath = path.join(process.cwd(), "public", "care-instructions.jpeg");
    
    const thankYouExists = fs.existsSync(thankYouPath);
    const careExists = fs.existsSync(carePath);
    
    if (!thankYouExists) {
      console.log("Could not find thank-you-detailed.jpeg");
    }
    if (!careExists) {
      console.log("Could not find care-instructions.jpeg");
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 12px;">
        <div style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0; font-size: 28px; font-family: Georgia, serif;">Thank You for Your Order! 🎉</h2>
        </div>
        
        <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px; line-height: 1.6;">Dear Valued Customer,</p>
          
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">Your beautiful handmade pieces are on their way to you! We've enclosed special care cards and beautiful messages to cherish along with your order.</p>
          
          ${thankYouExists ? `
          <div style="margin: 30px 0; text-align: center;">
            <h3 style="color: #8B7355; margin-bottom: 15px;">💝 Thank You Card</h3>
            <img src="cid:thankyou" alt="Thank You Card" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
          </div>
          ` : ''}
          
          ${careExists ? `
          <div style="margin: 30px 0; text-align: center;">
            <h3 style="color: #8B7355; margin-bottom: 15px;">📋 Care Instructions</h3>
            <img src="cid:care" alt="Care Instructions" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
          </div>
          ` : ''}
          
          <p style="color: #8B5A3C; font-style: italic; text-align: center; font-size: 15px; margin: 30px 0;">
            "Each item is thoughtfully handcrafted, making it one-of-a-kind, just like you."
          </p>
          
          <hr style="border: none; border-top: 2px solid #E5D5C3; margin: 30px 0;">
          
          <p style="color: #333; font-size: 14px; margin-bottom: 10px;">With heartfelt appreciation,</p>
          <h3 style="color: #8B7355; margin: 10px 0; font-size: 18px;">BASHO BY SHIVANGI</h3>
          
          <div style="background: #FFF9F0; padding: 15px; border-radius: 8px; margin-top: 30px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              These images are embedded in this email for your convenience. You can save them for future reference.
            </p>
          </div>
        </div>
      </div>
    `;

    const attachments = [];
    
    if (thankYouExists) {
      attachments.push({
        filename: 'thank-you-card.jpeg',
        path: thankYouPath,
        cid: 'thankyou'
      });
    }
    
    if (careExists) {
      attachments.push({
        filename: 'care-instructions.jpeg',
        path: carePath,
        cid: 'care'
      });
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Basho Order - Care Cards & Thank You! 💝",
      html: emailContent,
      attachments: attachments,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
