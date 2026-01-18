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

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - GENERIC EMAIL');
      console.log(`To: ${to}, Subject: ${subject}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
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
export async function sendAccountDeletionOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - ACCOUNT DELETION');
      console.log(`Deletion OTP for ${email}: ${otp}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Security Alert: Account Deletion OTP - Basho',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Basho Security</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 30px;">You have requested to permanently delete your Basho account. This action cannot be undone. To proceed, please use the security verification code below:</p>
            
            <div style="background: white; border: 2px solid #EF4444; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              <p style="margin: 0; font-size: 12px; color: #999;">Deletion Verification Code</p>
              <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #EF4444; letter-spacing: 5px;">${otp}</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 20px;">This OTP will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;"><strong>If you did not request this, please change your password immediately and secure your account.</strong></p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending deletion OTP email:', error);
    return false;
  }
}

export async function sendNewContentNotification(
  type: 'product' | 'workshop',
  name: string,
  description: string,
  imageUrl: string,
  link: string
): Promise<void> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`📧 EMAIL SERVICE NOT CONFIGURED - NEW ${type.toUpperCase()}`);
      console.log(`Title: ${name}`);
      return;
    }

    // Dynamic import to avoid circular dependency issues during initialization
    const { connectDB } = await import("@/lib/mongodb");
    const User = (await import("@/models/User")).default;

    await connectDB();
    // Fetch users who have NOT explicitly opted out (defaults to true)
    const users = await User.find({
      role: 'customer',
      acceptsMarketingEmails: { $ne: false }
    }, 'email name');

    if (users.length === 0) return;

    console.log(`📧 Sending ${type} notification to ${users.length} users...`);

    const title = type === 'product' ? 'New Arrival at Basho!' : 'New Workshop Alert!';
    const actionText = type === 'product' ? 'Shop Now' : 'Book Now';
    const color = type === 'product' ? '#D97757' : '#D97757'; // Clay color for both for consistency

    // Send in batches to avoid overwhelming the transporter
    // For MVP, simple loop is fine.
    for (const user of users) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `${title}: ${name}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
             <div style="background-color: #FDFBF7; padding: 40px 20px; text-align: center;">
               <h1 style="color: #5A3E36; margin: 0; font-family: serif; font-size: 32px;">Basho</h1>
               <p style="color: #8C7E72; letter-spacing: 2px; text-transform: uppercase; font-size: 10px; margin-top: 5px;">by Shivangi</p>
             </div>
             
             <div style="padding: 0;">
               ${imageUrl ? `<img src="${imageUrl}" alt="${name}" style="width: 100%; height: auto; display: block;" />` : ''}
             </div>

             <div style="padding: 40px 30px; text-align: center;">
               <p style="color: #D97757; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; margin-bottom: 20px;">${type === 'product' ? 'Just Added' : 'Upcoming Workshop'}</p>
               <h2 style="color: #5A3E36; font-size: 28px; margin: 0 0 20px 0; font-family: serif;">${name}</h2>
               <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">${description}</p>
               
               <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${link}" style="display: inline-block; background-color: ${color}; color: white; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">${actionText}</a>
             </div>

             <div style="background-color: #F9F9F9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
               <p style="color: #999999; font-size: 12px; margin: 0;">© 2024 Basho. All rights reserved.</p>
               <p style="color: #999999; font-size: 12px; margin-top: 10px;">You received this email because you are a registered member of Basho.</p>
             </div>
          </div>
        `
      };

      // Fire and forget individual emails logic inside the loop? 
      // Ideally we await to ensure it sends, but we don't want to block the user loop forever.
      // We'll await inside the loop for safety in this version.
      try {
        await transporter.sendMail(mailOptions);
      } catch (e) {
        console.error(`Failed to send email to ${user.email}`, e);
      }
    }


    console.log(`✅ Finished sending notifications.`);
  } catch (error) {
    console.error('Error in sendNewContentNotification:', error);
  }
}

export async function sendWalletCreditEmail(email: string, amount: number, newBalance: number, message?: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - WALLET CREDIT');
      console.log(`Credit ${amount} to ${email}. New Balance: ${newBalance}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Wallet Credited - Basho',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Wallet Credited</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">Your Basho wallet has been credited!</p>
            
            <div style="background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
              
              <div style="margin-bottom: 15px;">
                  <p style="margin: 0; font-size: 12px; color: #999;">Amount Added</p>
                  <p style="margin: 5px 0 10px 0; font-size: 32px; font-weight: bold; color: #10B981;">₹${amount}</p>
              </div>

               <div style="border-top: 1px dashed #eee; padding-top: 15px;">
                  <p style="margin: 0; font-size: 12px; color: #999;">New Wallet Balance</p>
                  <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: #333;">₹${newBalance}</p>
              </div>
              
              ${message ? `<p style="margin-top: 15px; font-style: italic; color: #666;">"${message}"</p>` : ''}
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">You can use this balance for your next purchase on Basho.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending wallet credit email:', error);
    return false;
  }
}

export async function sendAdminNotification(subject: string, html: string): Promise<boolean> {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || !adminEmail) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - ADMIN NOTIFICATION');
      console.log(`Subject: ${subject}`);
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `[Admin Alert] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Admin Notification</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <h3 style="color: #333; font-size: 18px; margin-top: 0;">${subject}</h3>
            <div style="color: #666; font-size: 14px; line-height: 1.6;">
              ${html}
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">Basho Admin System</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Admin notification sent: ${subject}`);
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}

export async function sendWorkshopBookingEmail(email: string, workshopName: string, date: string, participants: number, amount: number): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('📧 EMAIL SERVICE NOT CONFIGURED - WORKSHOP BOOKING');
      return true;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Workshop Booking Confirmed - ${workshopName} - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #D97757 0%, #A05A44 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Booking Confirmed</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333; font-size: 16px;">Hello,</p>
            <p style="color: #666;">We are excited to see you at the workshop!</p>
            
            <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #5A3E36; margin: 0 0 10px 0;">${workshopName}</h3>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Participants:</strong> ${participants}</p>
              <p style="margin: 5px 0;"><strong>Total Paid:</strong> ₹${amount}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">Please arrive 10 minutes early. All materials will be provided.</p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending workshop email:', error);
    return false;
  }
}

export async function sendStudioVisitConfirmationEmail(email: string, name: string, date: string, time: string, guests: number): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return true;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Studio Visit Requested - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #6B5B45 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Visit Request Received</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333;">Hello ${name},</p>
            <p style="color: #666;">We have received your request to visit our studio. We will confirm your slot shortly.</p>
            
            <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Proposed Date:</strong> ${new Date(date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${time || 'Not specified'}</p>
              <p><strong>Guests:</strong> ${guests}</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">We look forward to welcoming you.</p>
             <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function sendCustomOrderConfirmationEmail(email: string, name: string, productType: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return true;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Custom Order Request Received - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #5A3E36 0%, #3E2b26 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Request Received</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333;">Hello ${name},</p>
            <p style="color: #666;">Thank you for your interest in a custom piece (${productType}). We have received your request and our team will review the details.</p>
            <p style="color: #666;">We will get back to you with a quotation and timeline within 24-48 hours.</p>
             <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) { console.error(e); return false; }
}

export async function sendCustomOrderQuotationEmail(email: string, name: string, productType: string, quoteAmount: number, message: string): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return true;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Quotation for Custom Order - Basho`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Quotation Ready</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333;">Hello ${name},</p>
            <p style="color: #666;">We have prepared a quotation for your custom <strong>${productType}</strong>.</p>
            
            <div style="background: white; border: 2px solid #10B981; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
               <p style="color: #999; font-size: 12px; margin:0;">Estimated Cost</p>
               <h1 style="color: #10B981; margin: 10px 0;">₹${quoteAmount}</h1>
               <p style="color: #666; font-size: 14px;">${message}</p>
            </div>

            <p style="color: #666; font-size: 14px;">To proceed, please reply to this email or visit your account dashboard.</p>
             <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) { console.error(e); return false; }
}

export async function sendOrderReceivedEmail(email: string, orderNumber: string, itemsCount: number, totalAmount: number): Promise<boolean> {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) return true;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Order Received - Awaiting Confirmation - ${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B7355 0%, #6B5B45 100%); padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0; text-align: center;">Order Received</h2>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="color: #333;">Hello,</p>
            <p style="color: #666;">Thank you for your order! We have received your payment and order details.</p>
            <p style="color: #666;">Your order is currently <strong>awaiting confirmation</strong> from our team. You will receive another email once it has been confirmed and shipped.</p>
            
            <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Items:</strong> ${itemsCount}</p>
              <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            </div>
            
             <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">© 2024 Basho. All rights reserved.</p>
          </div>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (e) { console.error(e); return false; }
}
