import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { FaStore } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../Components/FoodCard';
import { IoIosArrowRoundBack } from 'react-icons/io';


const Shop = () => {
    
    const {shopId} = useParams();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [shop, setShop] = useState([]);

    const handleShop = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/item/get-item-by-shop/${shopId}`, {
                withCredentials: true
            });
            console.log(result.data);
            setShop(result.data.shop);
            setItems(result.data.items);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        handleShop();
    }, [shopId]);

  return (
    <div className='min-h-screen bg-gray-50'>
        <button className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow transition cursor-pointer' onClick={() => navigate('/')}>
            <IoIosArrowRoundBack className='w-7 h-7'/> Back
        </button>
        {shop &&
            <div className='relative w-full h-64 md:h-80 lg:h-96'>
                <img src={shop.image} alt="" className='w-full h-full object-cover'/>
                <div className='absolute inset-0  bg-linear-to-b from-black/70 to-black-30 flex flex-col justify-center items-center text-center px-4'>
                    <FaStore className='text-white  text-4xl mb-3 drop-shadow-md'/>
                    <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>{shop.name}</h1>
                    <div className='flex items-center justify-center mt-10 gap-2'>
                        <MdLocationOn size={23} className='  text-[#ff4d2d]'/>
                        <p className='text-lg font-medium text-gray-200 '>{shop.address}</p>
                    </div>
                </div>
            </div>
        }

        <div className='max-w-7xl mx-auto px-6 py-10'>
            <h2 className='flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800'><FaUtensils className='text-[#ff4d2d]'/>Our Menu</h2>

            {items.length > 0 ? (
                <div className='flex flex-wrap justify-center gap-8'>
                    {items.map((item, index) => (
                        <FoodCard data={item}/>
                    ))}
                </div>
            ) : (
                <p className='text-center text-gray-500 text-lg'>No items available...</p>
            )}
        </div>
    </div>
  )
}

export default Shop
