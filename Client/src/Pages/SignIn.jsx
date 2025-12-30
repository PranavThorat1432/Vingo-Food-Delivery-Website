import React, { useState } from 'react'
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { MoonLoader } from 'react-spinners';
import { setUserData } from '../Redux/userSlice';
import { useDispatch } from 'react-redux';


const SignIn = () => {

    const primaryColor = '#ff4d2d';
    const hoverColor = '#e64323';
    const bgColor = '#fff9f6';
    const borderColor = '#ddd';

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignin = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, 
                {  email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true
                }
            );
            dispatch(setUserData(result.data));
            setError('');
            navigate('/');

        } catch (error) {
            console.error('Signin error:', error.response?.data || error.message);
            setError(error.response?.data?.message || 'An error occurred during signin');
        } finally {
            setLoading(false);
        }
    };


    const handleGoogleAuth = async () => {
    
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
    
        try {
            const {data} = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                email: result.user.email,

            }, {withCredentials: true});
            dispatch(setUserData(data));
    
        } catch (error) {
            console.log(error);
        }
    };


  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4' style={{backgroundColor: bgColor}}>
        <div className='bg-white rounded-xl shadow-lg w-full max-w-md px-8 py-5 border' style={{borderColor: borderColor}}>
            <h1 className='text-3xl font-bold mb-2' style={{color: primaryColor}}>Vingo</h1>
            <p className='text-gray-600 mb-8'>Create your account to get started with delicious food deliveries.</p>

            {/* Email */}
            <div className='mb-3'>
                <label htmlFor="email" className='block text-gray-700 font-medium mb-1'>Email</label>
                <input type="email" placeholder='Email' className='w-full rounded-lg px-3 py-2 focus:outline-none' style={{border: `1px solid ${borderColor}`, borderRadius: '0.5rem'}} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = borderColor} onChange={(e) => setEmail(e.target.value)} value={email} required/>
            </div>

            {/* Password */}
            <div className='mb-3'>
                <label htmlFor="password" className='block text-gray-700 font-medium mb-1'>Password</label>

                <div className='relative'>
                    <input type={showPassword ? 'text' : 'password'} placeholder='Password' className='w-full rounded-lg px-3 py-2 focus:outline-none' style={{border: `1px solid ${borderColor}`, borderRadius: '0.5rem'}} onFocus={(e) => e.target.style.borderColor = primaryColor} onBlur={(e) => e.target.style.borderColor = borderColor} onChange={(e) => setPassword(e.target.value)} value={password} required/>

                    <button className='absolute top-3 right-3 cursor-pointer text-gray-500' onClick={() => setShowPassword(!showPassword)}>{showPassword ? <IoEyeOff /> : <IoEye />}</button>
                </div>

                <div className='text-right mb-5 text-[#e64323] cursor-pointer' onClick={() => navigate('/forgotPassword')}>Forgot Password?</div>
            </div>

            
            <button 
                className={`w-full rounded-lg font-semibold py-2 transition duration-200 ${loading ? 'opacity-80' : 'hover:bg-[#e64323]'} flex items-center justify-center gap-2 bg-[#ff4d2d] text-white cursor-pointer`} 
                onClick={handleSignin} 
                disabled={loading}
            >
                {loading ? (
                    <>
                        <MoonLoader size={20} color="#ffffff" />
                        <span>Signing in...</span>
                    </>
                ) : 'Sign In'}
            </button>

            {error &&
                <p className='text-red-700 text-center mt-2'>*{error}</p>
            }

            <button className='w-full mt-4 flex items-center justify-center gap-2 border rounded-lg px-4 py-2 transition duration-200 border-gray-300 hover:bg-gray-100 cursor-pointer' onClick={handleGoogleAuth}>
                <div>
                    <FcGoogle size={20}/> 
                </div>
                <span className='font-semibold'>Signin with Google</span>
            </button>

            <p className='text-center mt-2'>Don't have an account? <span className='text-[#ff4d2d] cursor-pointer' onClick={() => navigate('/signup')}>SignUp</span></p>
        </div>

    </div>
  )
}

export default SignIn
