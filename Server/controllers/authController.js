import User from "../models/UserModel.js";
import bcrypt from 'bcryptjs';
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";


export const signUp = async (req, res) => {
    try {
        const {fullName, email, password, mobileNo, role} = req.body;
        let user = await User.findOne({email});
        if(user) {
            return res.status(400).json({
                success: true,
                message: 'Email already exist!'
            });
        }

        if(password.length < 6) {
            return res.status(400).json({
                success: true,
                message: 'Password must be at least 6 characters long!'
            });
        }

        if(mobileNo.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Mobile number must be at least 10 digits long!'
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        user = await User.create({
            fullName,
            email,
            password: hashPassword,
            mobileNo,
            role
        });

        const token = genToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            success: true,
            message: 'User Created Successfully!',
            user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `SignUp Error: ${error}`
        });
    }  
};



export const SignIn = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                success: true,
                message: 'User does not exist!'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({
                success: true,
                message: 'Invalid Password'
            });
        }


        const token = genToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: 'User SignIn Successfully!',
            user,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `SignIn Error: ${error}`
        });
    }  
};


export const SignOut = async (req, res) => {
    try {
        res.clearCookie('token');

        return res.status(200).json({
            success: true,
            message: 'User Logout Successfully!',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `SignOut Error: ${error}`
        });
    }
};


export const sendOtp = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({
                success: true,
                message: 'User does not exist!'
            });
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        user.isOtpVerified = false;

        await user.save();
        await sendOtpMail(email, otp);

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Send OTP Error: ${error}`
        });
    }
};


export const verifyOtp = async (req, res) => {
    try {
        const {email, otp} = req.body;
        const user = await User.findOne({email});
        if(!user || user.resetOtp != otp || user.otpExpires < Date.now()) {
            return res.status(400).json({
                success: true,
                message: 'Invalid / Expired OTP'
            });
        }

        user.isOtpVerified = true;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'OTP Verfied successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Verify OTP Error: ${error}`
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const {email, newPassword} = req.body;
        const user = await User.findOne({email});
        if(!user || !user.isOtpVerified) {
            return res.status(400).json({
                success: true,
                message: 'OTP verification required!'
            });
        }
        user.password = await bcrypt.hash(newPassword, 10);
        user.isOtpVerified = false;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password Reset successfully!'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Reset Password Error: ${error}`
        });
    }
};


export const googleAuth = async (req, res) => {
    try {
        const {fullName, email, mobileNo, role} = req.body;
        let user = await User.findOne({email});
        if(!user) {
            user = await User.create({
                fullName, email, mobileNo, role
            });
        }

        const token = genToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: 'User SignUp Successfully!',
            user,
        });
        

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Google Auth Error: ${error}`
        });
    }
};