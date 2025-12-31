import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6";
import { FiSearch } from "react-icons/fi";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { MdLogout } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FcPackage } from "react-icons/fc";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import { TbReceipt2 } from "react-icons/tb";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../Redux/userSlice';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {

  const {userData, currentCity, cartItems} = useSelector((state) => state.user);
  const {myShopData} = useSelector((state) => state.owner);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [popUp, setPopup] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');

  const handleLogout = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true
      });
      dispatch(setUserData(null));

    } catch (error) {
      console.log(error);
    }
  };

  const handleSearchItems = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, {
          withCredentials: true
        });
        dispatch(setSearchItems(result.data));
  
      } catch (error) {
        console.log(error);
      }
    };

    useEffect(() => {
      if(query) {
        handleSearchItems();
      } else {
        dispatch(setSearchItems(null));
      }
    }, [query]);


  return (

    <div className='w-full h-25 flex items-center justify-between md:justify-center gap-[30px] px-5 fixed top-0 z-9999 bg-[#fff9f6] overflow-visible'>
      <h1 className='text-3xl font-bold mb-2 text-[#ff4d2d]'>Vingo</h1>

      {userData.role === 'User' && 
        <div className='md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-5 md:flex hidden'>
                  <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400'>
              <FaLocationDot className='w-5 h-5 text-[#ff4d2d]'/>
              <div className='w-[80%] truncate text-gray-600 font-semibold'>{currentCity}</div>
            </div>
            <div className='w-[80%] flex items-center gap-2.5'>
              <FiSearch className='w-5 h-5 text-[#ff4d2d]'/>
              <input type="text" placeholder='Search Delicious Food...' className='outline-none px-2.5 text-gray-7w-full font-semibold' onChange={(e) => setQuery(e.target.value)} value={query}/>
            </div>
        </div>
      }

      {showSearch && userData.role === 'User' && 
        <div className='w-[90%] h-[70px] md:hidden bg-white shadow-xl rounded-lg items-center gap-5 flex fixed top-20 le[5%]'>
          <div className='flex items-center w-[30%] overflow-hidden gap-2.5 px-2.5 border-r-2 border-gray-400'>
            <FaLocationDot className='w-5 h-5 text-[#ff4d2d]'/>
            <div className='w-[80%] truncate text-gray-600 font-semibold'>{currentCity}</div>
          </div>
          <div className='w-[80%] flex items-center gap-2.5'>
            <FiSearch className='w-5 h-5 text-[#ff4d2d]' />
            <input type="text" placeholder='Search Delicious Food...' className='outline-none px-2.5 text-gray-700 w-fufont-semibold' onChange={(e) => setQuery(e.target.value)} value={query}/>
          </div>
        </div>
      }

      <div className='flex items-center gap-5'>
        {userData.role === 'User' &&
          (showSearch ? 
            <RxCross2 className='w-5 h-5 text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(false)}/> 
            : <FiSearch className='w-5 h-5 text-[#ff4d2d] md:hidden' onClick={() => setShowSearch(true)}/>)
        }
      
        {userData.role === 'Owner' ? 
          <>
            {myShopData && <>
              <button className='hidden md:flex  items-center gap-1 p-2 cursor-pointer rounded-lg bg-[#ff452d]/10 text-[#ff4d2d] text-sm font-medium' onClick={() => navigate('/add-food')}>
                <FaPlus className='w-5 h-5'/>
                <span>Add Food Item</span>
              </button> 

              <button className=' md:hidden flex items-center gap-1 p-2 cursor-pointer rounded-xl bg-[#ff452d]/10 text-[#ff4d2d] text-sm' onClick={() => navigate('/add-food')}>
                <FaPlus className='w-5 h-5'/>
              </button> </>
            }

            <div className='hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 rounded-lg bg-[#ff452d]/10 text-[#ff4d2d] font-medium' onClick={() => navigate('/my-orders')}>
              <TbReceipt2 className='w-5 h-5'/>
              <span>My Orders</span>
              <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-px'>0</span>
            </div>

            <div className='md:hidden flex items-center gap-2 cursor-pointer relative px-1 py-1 rounded-lg bg-[#ff452d]/10 text-[#ff4d2d] font-medium' onClick={() => navigate('/my-orders')}>
              <TbReceipt2 className='w-6.5 h-6.5'/>
              <span className='absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-1.5 py-px'>0</span>
            </div>
          </> :
          (
            <>
            {userData.role === 'User' &&
              <div className='relative cursor-pointer' onClick={() => navigate('/cart')}>
                <FiShoppingCart className='w-5 h-5 text-[#ff4d2d]'/>
                <span className='absolute right-[-9px] -top-3 text-[#ff4d2d]'>{cartItems?.length || 0}</span>
              </div>  
            }
                  
              <button className='hidden md:block px-3 py-1 rounded-lg bg-[#ff452d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer' onClick={() => navigate('/my-orders')}>My Orders</button>
            </>
          )
        }
      
      
        <div className='w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18pshadow-xl font-semibold cursor-pointer' onClick={() => setPopup(!popUp)}>
          {userData?.fullName?.slice(0, 1)}
        </div>
              
        {popUp && <div className={`fixed top-20 right-2.5 ${userData.role === 'Delivery-Boy' ? 'md:right-[10%] lg:right-[40%]' : 'md:right-[10%] lg:right-[25%]'}  w-[180px] bg-white shadow-2rounded-xl p-5 flex flex-col gap-2.5 z-9999 shadow`}>
          <div className='text-[17px] font-semibold flex  items-center gap-2'><FaUser />{userData.fullName}</div>
          {userData.role === 'User' &&
            <div className='md:hidden text-[#ff4d2d] font-semibold cursor-pointer flex items-center gap-1.5' onClick={() => navigate('/my-orders')}><FcPackage className='h-5 w-5 '/>My Orders</div>
          }
          <div className='text-[#ff4d2d] font-semibold cursor-pointer flex items-center gap-1.5' onClick={handleLogout}>
            <MdLogout className='h-5 w-5 ' />LogOut</div>
        </div>}
              
              
      </div>
    
    </div>
  )
}

export default Navbar
