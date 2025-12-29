import React, { useRef, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa6";
import { MdSaveAlt } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../Redux/ownerSlice';

const CreateEditShop = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {myShopData} = useSelector((state) => state.owner);
    const {currentCity, currentState, currentAddress} = useSelector((state) => state.user);

    // Ensure all controlled input values are always strings to avoid React warnings
    const [name, setName] = useState(myShopData?.name || '');
    const [address, setAddress] = useState(myShopData?.address || currentAddress || '');
    const [city, setCity] = useState(myShopData?.city || currentCity || '');
    const [state, setState] = useState(myShopData?.state || currentState || '');
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null);    
    const [backendImage, setBackendImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBackendImage(file);
            setFrontendImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent multiple submissions
        
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('address', address);
            if(backendImage) {
                formData.append('image', backendImage);
            }

            const result = await axios.post(`${serverUrl}/api/shop/create-edit-shop`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            dispatch(setMyShopData(result.data));
            setFrontendImage(null);
            setBackendImage(null);
            navigate('/'); // Navigate to dashboard after successful save
            
        } catch (error) {
            console.error('Error saving shop:', error);
            // You might want to add error handling here (e.g., show error toast/message)
        } finally {
            setIsLoading(false);
        }
    };

  return (
    <div className='flex justify-center flex-col items-center p-6 bg-linear-to-br from-orange-50 relative to-white min-h-screen'>
        <div className='absolute top-5 left-5 z-10 mb-2.5' onClick={() => navigate('/')}>
            <IoIosArrowRoundBack className='w-10 h-10 text-[#ff4d2d] cursor-pointer font-bold'/>
        </div>

        <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100'>
            <div className='flex flex-col items-center mb-6'>
                <div className='bg-orange-100 p-4 rounded-full mb-4'>
                    <FaUtensils className='text-[#ff4d2d] w-16 h-16'/>
                </div>
                <div className='text-3xl font-extrabold text-gray-900'>
                    {!myShopData ? 'Add Shop' : 'Edit Shop'}
                </div>
            </div>

            <form className='space-y-5' onSubmit={handleSubmit}>
                {/* Shop Name */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                    <input type="text" placeholder='Shop Name' className='w-full px-4 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e) => setName(e.target.value)} value={name}/>
                </div>

                {/* Shop Image */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Shop Image</label>
                    <div className='flex flex-col items-center'>
                        <label className='w-full flex flex-col items-center px-4 py-6 bg-white text-orange-600 rounded-lg border-2 border-dashed border-orange-300 cursor-pointer hover:bg-orange-50 transition-colors'>
                            <svg className='w-10 h-10 mb-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'></path>
                            </svg>
                            <p className='text-sm text-gray-600'>
                                <span className='font-semibold'>Click to upload</span> or drag and drop
                            </p>
                            <p className='text-xs text-gray-500'>PNG, JPG, JPEG (MAX. 5MB)</p>
                            <input 
                                type='file' 
                                className='hidden' 
                                accept='image/*' 
                                onChange={handleImage}
                            />
                        </label>

                        {frontendImage && (
                            <div className='mt-4 w-full relative group'>
                                <img 
                                    src={frontendImage} 
                                    alt='Shop preview' 
                                    className='w-full h-56 object-cover rounded-lg border-2 border-orange-200 shadow-sm transition-transform duration-200 group-hover:shadow-md'
                                />
                                <button
                                    type='button'
                                    onClick={() => {
                                        setFrontendImage(null);
                                        setBackendImage(null);
                                    }}
                                    className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors cursor-pointer'
                                    aria-label='Remove image'
                                >
                                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 18L18 6M6 6l12 12'></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shop City & State */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>City</label>
                        <input type="text" placeholder='City' className='w-full px-4 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e) => setCity(e.target.value)} value={city}/>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>State</label>
                        <input type="text" placeholder='State' className='w-full px-4 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e) => setState(e.target.value)} value={state}/>
                    </div>
                </div>

                {/* Shop Address */}
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Address</label>
                    <input type="text" placeholder='Shop Address' className='w-full px-4 py-2  border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500' onChange={(e) => setAddress(e.target.value)} value={address}/>
                </div>

                <button 
                    type='submit'
                    className={`w-full ${isLoading ? 'bg-orange-400' : 'bg-[#ff4d2d] hover:bg-orange-600'} text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <svg className='animate-spin -ml-1 mr-2 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        <>
                            <MdSaveAlt className='w-5 h-5'/>
                            Save
                        </>
                    )}
                </button>
            </form>
        </div>
    </div>
  )
}

export default CreateEditShop
