import React from 'react';
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuatity } from '../Redux/userSlice';

const CartItemCard = ({ data }) => {
    const dispatch = useDispatch();

    const handleQtyIncrease = (e, id, currentQty) => {
        e.stopPropagation();
        dispatch(updateQuatity({
            id: id,
            quantity: currentQty + 1,
        }));
    };

    const handleQtyDecrease = (e, id, currentQty) => {
        e.stopPropagation();
        if (currentQty > 1) {
            dispatch(updateQuatity({
                id: id,
                quantity: currentQty - 1,
            }));
        }
    };

    const handleRemoveItem = (e, id) => {
        e.stopPropagation();
        if (window.confirm('Remove this item from cart?')) {
            dispatch(removeCartItem(id));
        }
    };

    return (
        <div className='group flex items-center justify-between bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-orange-100'>
            <div className='flex items-center gap-4 flex-1 min-w-0'>
                <div className='relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-gray-100'>
                    <img 
                        src={data?.image} 
                        alt={data?.name} 
                        className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                </div>
                <div className='min-w-0'>
                    <h3 className='font-medium text-gray-800 truncate'>{data?.name}</h3>
                    <p className='text-sm text-gray-500'>₹{data?.price} × {data?.quantity}</p>
                    <p className='font-bold text-orange-500 text-lg'>₹{data?.price * data?.quantity}</p>
                </div>
            </div>

            <div className='flex items-center gap-2 ml-4'>
                <div className='flex items-center bg-orange-50 rounded-full overflow-hidden'>
                    <button 
                        className={`p-1.5 text-orange-500 hover:bg-orange-100 transition-colors ${data?.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-100 cursor-pointer'}`}
                        disabled={data?.quantity <= 1}
                        onClick={(e) => handleQtyDecrease(e, data.id, data.quantity)}
                        aria-label='Decrease quantity'
                    >
                        <FaMinus size={12} />
                    </button>
                    <span className='text-sm font-medium w-6 text-center'>{data?.quantity}</span>
                    <button 
                        className='p-1.5 text-orange-500 hover:bg-orange-100 transition-colors cursor-pointer'
                        onClick={(e) => handleQtyIncrease(e, data.id, data.quantity)}
                        aria-label='Increase quantity'
                    >
                        <FaPlus size={12} />
                    </button>
                </div>

                <button 
                    className='p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full cursor-pointer transition-colors ml-1'
                    onClick={(e) => handleRemoveItem(e, data.id)}
                    aria-label='Remove item'
                >
                    <FaTrash size={14} />
                </button>
            </div>
        </div>
  )
}

export default CartItemCard
