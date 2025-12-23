import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});


// OTP main for password reset
export const sendOtpMail = async (to, otp) => { 
    await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password",
    text: `Your OTP for password reset is ${otp}. It expires in 5 minutes.`,
    html: `
        <div style="display: flex; align-items: center; justify-content: center;">
            <div style="font-family: Arial, sans-serif; max-width: 480px; padding: 20px; background: #f7f7f7;">
                <h2 style="color: #333;">Password Reset Request</h2>
                <p style="font-size: 15px; color: #555;">
                    You requested to reset your password. Use the OTP below:
                </p>

                <div style="
                    background: #ffffff;
                    padding: 15px 20px;
                    border-radius: 6px;
                    margin: 20px 0;
                    border-left: 4px solid #4a90e2;
                    font-size: 18px;
                    font-weight: bold;
                    color: #222;">
                    OTP: ${otp}
                </div>

                <p style="font-size: 14px; color: #777;">
                    This OTP will expire in <b>5 minutes</b>.  
                    If you did not request this, you can ignore this email.
                </p>

                <p style="font-size: 14px; color: #999; margin-top: 30px;">
                    — Team Vingo
                </p>
            </div>
        </div>
        `
    });
};


// OTP mail for delivery verfication to the customer
export const sendDeliveryOtpMail = async (user, otp, orderId) => { 
    await transporter.sendMail({
    from: process.env.EMAIL,
    to: user.email,
    subject: "OTP for your Delivery Order",
    text: `Your OTP for Delivery Order is ${otp}. It expires in 5 minutes.`,
    html: `
        <div style="display: flex; align-items: center; justify-content: center;">
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; padding: 25px; background: #fdfdfd; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">Delivered</span>
                </div>

                <h2 style="color: #333; margin-top: 0; text-align: center;">Order Delivered!</h2>
                
                <p style="font-size: 15px; color: #555; line-height: 1.6; text-align: center;">
                    Your order <b>#${orderId.toString().slice(-6)}</b> has been successfully handed over by our delivery partner.
                </p>

                <div style="
                    background: #f1f8e9;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border: 1px dashed #4caf50;
                    text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 13px; color: #558b2f; font-weight: bold;">VERIFICATION COMPLETE</p>
                    <div style="font-size: 28px; font-weight: bold; color: #2e7d32; letter-spacing: 2px;">
                        OTP: ${otp}
                    </div>
                </div>

                <p style="font-size: 13px; color: #777; text-align: center;">
                    If you did not receive this package or have any issues with your items, please contact support immediately.
                </p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                    <p style="font-size: 14px; color: #333; margin-bottom: 5px;">How was your experience?</p>
                    <p style="font-size: 20px;">⭐ ⭐ ⭐ ⭐ ⭐</p>
                    <p style="font-size: 14px; color: #999; margin-top: 20px;">
                        Thank you for choosing <b>Vingo</b>!
                    </p>
                </div>
            </div>
        </div>
        `
    });
};