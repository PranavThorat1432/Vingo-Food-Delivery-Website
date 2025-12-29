import React from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { IoMdCart } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CartItemCard from '../Components/CartItemCard';

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems = [], totalAmount = 0 } = useSelector((state) => state.user || {});
    const deliveryFee = cartItems.length > 0 ? 40 : 0;
    const totalPayable = totalAmount + deliveryFee;

    return (
        <div className='min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto'>
                {/* Header */}
                <div className='flex items-center gap-4 mb-8'>
                    <button 
                        onClick={() => navigate('/')}
                        className='p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors text-gray-600 hover:text-orange-500'
                        aria-label='Go back'
                    >
                        <IoIosArrowRoundBack className='w-6 h-6' />
                    </button>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Your Cart</h1>
                    <div className='ml-auto flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium'>
                        <IoMdCart className='mr-1' />
                        {cartItems?.length || 0} {cartItems?.length === 1 ? 'Item' : 'Items'}
                    </div>
                </div>

                {cartItems?.length === 0 ? (
                    <div className='text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100'>
                        <div className='mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-4'>
                            <IoMdCart className='text-3xl text-orange-400' />
                        </div>
                        <h2 className='text-xl font-semibold text-gray-800 mb-2'>Your cart is empty</h2>
                        <p className='text-gray-500 mb-6'>Looks like you haven't added anything to your cart yet</p>
                        <button 
                            onClick={() => navigate('/')}
                            className='bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors shadow-sm cursor-pointer'
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {/* Cart Items */}
                        <div className='space-y-4'>
                            {cartItems?.map((item, index) => (
                                <CartItemCard data={item} key={`${item.id}_${index}`} />
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
                            <h2 className='text-lg font-semibold text-gray-800 mb-4'>Order Summary</h2>
                            
                            <div className='space-y-3 mb-6'>
                                <div className='flex justify-between text-gray-600'>
                                    <span>Subtotal</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>
                                <div className='flex justify-between text-gray-600'>
                                    <span>Delivery Fee</span>
                                    <span>{deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'Free'}</span>
                                </div>
                                <div className='border-t border-gray-100 my-2'></div>
                                <div className='flex justify-between font-semibold text-lg text-gray-800'>
                                    <span>Total</span>
                                    <span>₹{totalPayable.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                onClick={() => navigate('/checkout')}
                                className='w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center cursor-pointer'
                            >
                                Proceed to Checkout
                                <svg className='w-5 h-5 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' />
                                </svg>
                            </button>

                            <div className='mt-4 flex items-center justify-center'>
                                <button 
                                    onClick={() => navigate('/')}
                                    className='text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center cursor-pointer'
                                >
                                    <IoIosArrowRoundBack className='mr-1' />
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
  )
}

export default CartPage
