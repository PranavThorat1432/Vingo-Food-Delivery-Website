import React, { useState } from 'react';
import { FaLeaf, FaPlus, FaMinus, FaStar, FaRegStar, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { FaDrumstickBite } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../Redux/userSlice';

const FoodCard = ({ data }) => {
    const dispatch = useDispatch();
    const { cartItems = [] } = useSelector((state) => state.user || {});
    const [quantity, setQuantity] = useState(1);
    const [isHovered, setIsHovered] = useState(false);
    const isInCart = cartItems.some(item => item.id === data._id);

    const handleQtyIncrease = (e) => {
        e.stopPropagation();
        setQuantity(prev => prev + 1);
    };

    const handleQtyDecrease = (e) => {
        e.stopPropagation();
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const renderStars = (rating) => {
        return Array(5).fill(0).map((_, i) => (
            i < (rating || 0) 
                ? <FaStar key={i} className='text-yellow-400 text-xs' /> 
                : <FaRegStar key={i} className='text-yellow-400 text-xs' />
        ));
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (quantity > 0) {
            dispatch(addToCart({
                id: data._id,
                name: data.name,
                price: data.price,
                image: data.image,
                shop: data.shop,
                quantity: quantity,
                foodType: data.foodType,
            }));
        }
    };

    return (
        <div 
            className={`
                w-48 bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 
                border border-gray-100 flex flex-col transform hover:-translate-y-1 cursor-pointer
            `}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Food Image with Badge */}
            <div className='relative w-full h-32 overflow-hidden'>
                <img 
                    src={data?.image} 
                    alt={data?.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
                />
                <div className={`absolute top-2 right-2 bg-white w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-transform duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                    {data?.foodType === 'Veg' ? (
                        <FaLeaf className='text-green-600 text-xs'/>
                    ) : (
                        <FaDrumstickBite className='text-red-600 text-xs'/>
                    )}
                </div>
            </div>

            {/* Food Info */}
            <div className='p-3 flex-1 flex flex-col'>
                <h3 className='font-semibold text-gray-800 text-sm mb-1 truncate'>{data?.name}</h3>
                <div className='flex items-center gap-1 mb-2'>
                    {renderStars(data?.rating?.average || 0)}
                    <span className='text-xs text-gray-500 ml-1'>({data?.rating?.count || 0})</span>
                </div>
                
                <div className='mt-auto flex items-center justify-between'>
                    <span className='font-bold text-orange-500 text-base'>₹{data?.price}</span>
                    
                    {isInCart ? (
                        <div className='flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white'>
                            <FaCheck size={12} />
                        </div>
                    ) : (
                        <div className='flex items-center bg-orange-50 rounded-full overflow-hidden'>
                            <button 
                                className='px-1.5 py-1 text-orange-500 hover:bg-orange-100 transition-colors text-xs'
                                onClick={handleQtyDecrease}
                                disabled={quantity <= 1}
                            >
                                <FaMinus size={10} />
                            </button>
                            <span className='text-xs w-6 text-center'>{quantity}</span>
                            <button 
                                className='px-1.5 py-1 text-orange-500 hover:bg-orange-100 transition-colors text-xs'
                                onClick={handleQtyIncrease}
                            >
                                <FaPlus size={10} />
                            </button>
                            <button 
                                className='bg-orange-500 hover:bg-orange-600 text-white p-1.5 transition-colors rounded-full ml-1'
                                onClick={handleAddToCart}
                                title='Add to Cart'
                            >
                                <FaShoppingCart size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
  )
}

export default FoodCard
