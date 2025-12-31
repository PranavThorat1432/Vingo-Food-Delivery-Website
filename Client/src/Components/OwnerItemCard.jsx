import axios from 'axios';
import React from 'react'
import { FaPen } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../Redux/ownerSlice';

const OwnerItemCard = ({data}) => {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDeleteItem = async (itemId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/delete-item/${data._id}`, {
        withCredentials: true
      });
      dispatch(setMyShopData(result.data));

    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className='flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl'>
      <div className='w-36 h-36 shrink-0 bg-gray-50 flex items-center justify-center overflow-hidden'>
        <img 
          src={data?.image} 
          alt={data?.name || 'Food item'} 
          className='w-full h-full object-contain p-2' />
      </div>

      <div className='flex flex-col justify-between p-3 flex-1'>
        <div className=''>
          <h2 className='text-base font-semibold text-[#ff4d2d]'>{data?.name}</h2>
          <p ><span className='font-medium text-gray-700'>Category: </span> {data?.category}</p>
          <p ><span className='font-medium text-gray-700'>Food Type:</span> {data?.foodType}</p>
        </div>

        <div className='flex items-center justify-between'>
          <div className='text-[#ff4d2d] font-bold'>
            ₹{data?.price}
          </div>

          <div className='flex items-center gap-2'>
            <div className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]  cursor-pointer' onClick={() => navigate(`/edit-food/${data._id}`)}>
              <FaPen className='w-4 h-4'/>
            </div>
            <div className='p-2 rounded-full hover:bg-[#ff4d2d]/10 text-[#ff4d2d]  cursor-pointer' onClick={handleDeleteItem}>
              <MdDelete className='w-5 h-5'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerItemCard
