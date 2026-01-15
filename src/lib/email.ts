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

export async function sendForgotPasswordEmail(email: string, otp: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - DEVELOPMENT MODE');
      console.log(`Reset Password OTP for ${email}: ${otp}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password - Basho',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #A0826D 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Basho</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 30px;">You requested to reset your password. Use the OTP below to proceed:</p>
            
            <div style="background: white; border: 2px solid #8B7355; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999;">Password Reset Code</p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #8B7355; letter-spacing: 5px;">${otp}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">If you didn't request a password reset, please ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reset password email:', error);
    return false;
  }
}

export async function sendWalletCreditEmail(email: string, amount: number, balance: number, message?: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - WALLET CREDIT');
      console.log(`Credit ${amount} to ${email}. New Balance: ${balance}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Wallet Credited - Basho',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Basho Wallet</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Great news! Your Basho wallet has been credited.</p>
            
            <div style="background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999;">Amount Added</p>
              <p style="margin: 5px 0 15px 0; font-size: 32px; font-weight: bold; color: #10B981;">₹${amount}</p>
              ${message ? `<p style="margin: 0; font-style: italic; color: #666;">"${message}"</p>` : ''}
              <div style="margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px;">
                <p style="font-size: 14px; color: #333;">New Balance: <strong>₹${balance}</strong></p>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">You can use this balance for your next purchase.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending wallet email:', error);
    return false;
  }
}

export async function sendRefundEmail(email: string, amount: number, orderNumber: string, message?: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - REFUND');
      console.log(`Refund ${amount} to ${email} for Order ${orderNumber}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Refund Initiated for Order ${orderNumber} - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Refund Initiated</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">We have initiated a refund for your order <strong>${orderNumber}</strong>.</p>
            
            <div style="background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999;">Refund Amount</p>
              <p style="margin: 5px 0 10px 0; font-size: 32px; font-weight: bold; color: #10B981;">₹${amount}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">Source: ${message || 'Original Payment Method'}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">The amount will reflect in your account within <strong>5-7 business days</strong>.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending refund email:', error);
    return false;
  }
}

export async function sendCancellationEmail(email: string, orderNumber: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - CANCELLATION');
      console.log(`Cancellation email for ${email} - Order ${orderNumber}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Cancelled - ${orderNumber} - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Order Cancelled</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Your order <strong>${orderNumber}</strong> has been cancelled.</p>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">If you have paid for this order, a refund has been initiated and will be credited to your account shortly.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
}

export async function sendOrderStatusEmail(email: string, orderNumber: string, status: string, trackingNumber?: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`📧 EMAIL SERVICE NOT CONFIGURED - ORDER STATUS: ${status}`);
      console.log(`Status update for ${email} - Order ${orderNumber} -> ${status}`);
      return true;
    }

    const titles: any = {
      confirmed: 'Order Confirmed',
      shipped: 'Order Shipped',
      delivered: 'Order Delivered',
    };

    const colors: any = {
      confirmed: ['#3B82F6', '#2563EB'], // Blue
      shipped: ['#F59E0B', '#D97706'],   // Amber
      delivered: ['#10B981', '#059669'],  // Emerald
    };

    const messages: any = {
      confirmed: 'Your order has been confirmed and is being processed.',
      shipped: 'Your order has been packed and shipped.',
      delivered: 'Your order has been delivered successfully. Thank you for shopping with Basho!',
    };

    const title = titles[status] || 'Order Update';
    const color = colors[status] || ['#8B7355', '#A0826D'];
    const message = messages[status] || `Your order status has been updated to ${status}.`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${title} - ${orderNumber} - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, ${color[0]} 0%, ${color[1]} 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">${title}</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">${message}</p>
            
            <div style="background: white; border: 2px solid ${color[0]}; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999;">Order Number</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: ${color[0]};">${orderNumber}</p>
              ${trackingNumber ? `<div style="margin-top: 15px; border-top: 1px dashed #eee; padding-top: 10px;">
                <p style="font-size: 12px; color: #999; margin: 0;">Tracking Number</p>
                <p style="font-size: 16px; font-weight: bold; color: #333; margin: 5px 0 0 0;">${trackingNumber}</p>
              </div>` : ''}
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">You can track your order status in your account.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} for order ${orderNumber} status ${status}`);
    return true;
  } catch (error) {
    console.error('Error sending order status email:', error);
    return false;
  }
}
