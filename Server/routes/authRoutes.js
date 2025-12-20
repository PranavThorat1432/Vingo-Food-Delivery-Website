import express from 'express';
import { googleAuth, resetPassword, sendOtp, SignIn, SignOut, signUp, verifyOtp } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/signin', SignIn);
authRouter.get('/signout', SignOut);
authRouter.post('/send-otp', sendOtp);
authRouter.post('/verify-otp', verifyOtp);
authRouter.post('/reset-password', resetPassword);
authRouter.post('/google-auth', googleAuth);

export default authRouter;