import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    // If email credentials are not configured, log OTP to console for testing
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - DEVELOPMENT MODE');
      console.log(`OTP for ${email}: ${otp}`);
      console.log('Add EMAIL_USER and EMAIL_PASSWORD to .env.local to send actual emails');
      return true; // Return true to allow testing without real email
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification OTP - Basho',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Basho</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 30px;">Thank you for signing up with Basho. To complete your registration, please verify your email address using the OTP below:</p>
            
            <div style="background: white; border: 2px solid #8B7355; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999;">Verification Code</p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #8B7355; letter-spacing: 5px;">${otp}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">If you didn't sign up for Basho, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}
