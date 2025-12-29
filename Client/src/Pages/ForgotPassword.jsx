import React, { useState } from 'react'
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { MdKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import axios from 'axios';
import { MoonLoader } from 'react-spinners';

const ForgotPassword = () => {

    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [step, setStep] = useState(0);
    const [otp, setOTP] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setComfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    
    const handleSendOTP = async () => {
        // Validate inputs
        if (!email) {
            setError('Please Enter Your Email!');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            const result = await axios.post(`${serverUrl}/api/auth/send-otp`, {email}, {
                withCredentials: true
            });
            console.log(result.data);
            setError('');
            setStep(1);

        } catch (error) {
            console.error('Send Otp error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'An error occurred during sending otp');
        } finally {
            setLoading(false);
        }
    };
    
    const handleVerifyOTP = async () => {
        // Validate inputs
        if (!otp) {
            setError('Please Enter OTP!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, {email, otp}, {
                withCredentials: true
            });
            console.log(result.data);
            setError('');
            setStep(2);

        } catch (error) {
            console.error('Verify Otp error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'An error occurred during verifying otp');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if(newPassword !== confirmPassword) {
            return setError('Password does not match')
        }

        if (!newPassword || !confirmPassword) {
            setError('Please Enter Password!');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await axios.post(`${serverUrl}/api/auth/reset-password`, {email, newPassword}, {
                withCredentials: true
            });
            console.log(result.data);
            setError('');
            navigate('/signin');

        } catch (error) {
            console.error('Reset Password error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'An error occurred during Reseting password');
        } finally {
            setLoading(false);
        }
    };
    
  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4 bg-[#fff9f6]'>
        <div className='bg-white rounded-xl shadow-lg w-full max-w-md p-8'>
            <div className='flex items-center gap-2 mb-4'>
                <MdKeyboardBackspace size={30} className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/signin')}/>
                <h1 className='text-2xl font-bold text-center text-[#ff4d2d] '>Forgot Password</h1>
            </div>

            {step === 0 && 
                <div>
                    {/* Email */}
                    <div className='mb-4 mt-6'>
                        <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                        <input type="email" placeholder='Email' className='w-full rounded-lg px-3 py-2 focus:outline-none' style={{border: `1px solid ${borderColor}`, borderRadius: '0.5rem'}} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = borderColor} onChange={(e) => setEmail(e.target.value)} value={email} required/>
                    </div>

                    <button 
                        className={`w-full rounded-lg font-semibold py-2 transition duration-200 ${loading ? 'opacity-80' : 'hover:bg-[#e64323]'} flex items-center justify-center gap-2 bg-[#ff4d2d] text-white cursor-pointer`} 
                        onClick={handleSendOTP} 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <MoonLoader size={20} color="#ffffff" />
                                <span>Sending OTP...</span>
                            </>
                        ) : 'Send OTP'}
                    </button>

                    {error &&
                        <p className='text-red-700 text-center mt-2'>*{error}</p>
                    }
                </div> 
            }

            {step === 1 && 
                <div>
                    {/* OTP */}
                    <div className='mb-4 mt-6'>
                        <label htmlFor="otp" className='block text-gray-700 font-medium mb-1'>OTP</label>
                        <input type="number" placeholder='Enter OTP' className='w-full rounded-lg px-3 py-2 focus:outline-none' style={{border: `1px solid ${borderColor}`, borderRadius: '0.5rem'}} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = borderColor} onChange={(e) => setOTP(e.target.value)} value={otp} required/>
                    </div>

                    <button 
                        className={`w-full rounded-lg font-semibold py-2 transition duration-200 ${loading ? 'opacity-80' : 'hover:bg-[#e64323]'} flex items-center justify-center gap-2 bg-[#ff4d2d] text-white cursor-pointer`} 
                        onClick={handleVerifyOTP} 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <MoonLoader size={20} color="#ffffff" />
                                <span>Verifying OTP...</span>
                            </>
                        ) : 'Verify OTP'}
                    </button>

                    {error &&
                        <p className='text-red-700 text-center mt-2'>*{error}</p>
                    }
                </div> 
            }

            {step === 2 && 
                <div>
                    {/* Reset Password */}
                    <div className='mb-4 mt-6'>
                        <label htmlFor="new-password" className='block text-gray-700 font-medium mb-1'>New Password</label>

                        <div className='relative'>
                            <input type={showPassword ? 'text' : 'password'} placeholder='New Password' className='w-full rounded-lg px-3 py-2 focus:outline-none' style={{border: `1px solid ${borderColor}`, borderRadius: '0.5rem'}} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = borderColor} onChange={(e) => setNewPassword(e.target.value)} value={newPassword} required/>

                            <button className='absolute top-3 right-3 cursor-pointer text-gray-500' onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IoEyeOff /> : <IoEye />}</button>
                        </div>
                    </div>

                    <div className='mb-4 mt-6'>
                        <label htmlFor="confirm-password" className='block text-gray-700 font-medium mb-1'>Confirm Password</label>

                        <div className='relative'>
                            <input type={showPassword ? 'text' : 'password'} placeholder='Confirm Password' className='w-full rounded-lg px-3 py-2 focus:outline-none' style={{border: `1px solid ${borderColor}`, borderRadius: '0.5rem'}} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = borderColor} onChange={(e) => setComfirmPassword(e.target.value)} value={confirmPassword} required/>

                            <button className='absolute top-3 right-3 cursor-pointer text-gray-500' onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IoEyeOff /> : <IoEye />}</button>
                        </div>
                    </div>

                    <button 
                        className={`w-full rounded-lg font-semibold py-2 transition duration-200 ${loading ? 'opacity-80' : 'hover:bg-[#e64323]'} flex items-center justify-center gap-2 bg-[#ff4d2d] text-white cursor-pointer`} 
                        onClick={handleResetPassword} 
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <MoonLoader size={20} color="#ffffff" />
                                <span>Reseting Password...</span>
                            </>
                        ) : 'Reset Password'}
                    </button>

                    {error &&
                        <p className='text-red-700 text-center mt-2'>*{error}</p>
                    }
                </div> 
            }

        </div>
    </div>
  )
}

export default ForgotPassword
