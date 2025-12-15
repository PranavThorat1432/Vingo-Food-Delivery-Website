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