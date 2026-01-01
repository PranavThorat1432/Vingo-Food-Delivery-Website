import React, { useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import { categories } from '../category';
import CategoryCard from './CategoryCard';
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import FoodCard from './FoodCard';
import { FaSpinner } from 'react-icons/fa';
import useGetItemsByCity from '../Hooks/useGetItemsBycity';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import Footer from './Footer';

const UserDashboard = ({data}) => {

  const navigate = useNavigate();
  const catScrollRef = useRef();
  const shopScrollRef = useRef();

  const { shopInMyCity, itemsInMyCity, searchItems } = useSelector((state) => state.user);
  const currentCity = useSelector((state) => state.user.currentCity);

  const [showLeftCatButton, setShowLeftCatButton] = useState(false);
  const [showRightCatButton, setShowRightCatButton] = useState(false);
  const [showLeftShopButton, setShowLeftShopButton] = useState(false);
  const [showRightShopButton, setShowRightShopButton] = useState(false);
  const [updatedItemsList, setUpdatedItemsList] = useState([]);

  const handleFitlerByCategory = (category) => {
    if(category === 'All') {
      setUpdatedItemsList(itemsInMyCity);

    } else {
      const filteredItems = itemsInMyCity.filter(item => item.category === category);
      setUpdatedItemsList(filteredItems);
      
    } 
  };

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity);
  }, [itemsInMyCity]);

  const scrollHandler = (ref, direction) => {
    if(ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth'
      })
    }
  };

  const updateScrollButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current;
    if(element) {
      setLeftButton(element.scrollLeft > 0);
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth);
    }
  };

  useEffect(() => {
    if(catScrollRef.current) {
      updateScrollButton(catScrollRef, setShowLeftCatButton, setShowRightCatButton)
      updateScrollButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)

      catScrollRef.current.addEventListener('scroll', () => {
        updateScrollButton(catScrollRef, setShowLeftCatButton, setShowRightCatButton)
      })

      shopScrollRef.current.addEventListener('scroll', () => {
        updateScrollButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      })
    }

    return () => {catScrollRef.current?.removeEventListener('scroll', () => {
        updateScrollButton(catScrollRef, setShowLeftCatButton, setShowRightCatButton)
    })
    shopScrollRef.current?.removeEventListener('scroll', () => {
        updateScrollButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    })};

  }, [categories]);


  return (
    <div className='w-screen min-h-screen flex flex-col items-center bg-[#fff9f6] overflow-y-auto'>
      <Navbar/>

      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4'>
          <h1 className='text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2'>Search Results</h1>
          <div className='w-full h-auto flex flex-wrap gap-6 justify-center'>
            {searchItems.map((item) => (
              <FoodCard key={item._id} data={item}/>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className='w-screen max-w-6xl flex flex-col gap-5 items-start p-2.5'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Insipiration for your first order</h1>
        <div className='w-full relative'>

          {showLeftCatButton &&
            <button className='absolute left-0 md:-left-10 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64525] z-10 cursor-pointer' onClick={() => scrollHandler(catScrollRef, 'left')}>
              <FaCircleChevronLeft/>
            </button>
          }

          <div className='w-full flex overflow-x-auto gap-4 pb-2' ref={catScrollRef}>
            {categories.map((cat, index) => (
              <CategoryCard name={cat.category} image={cat.image} key={index} onClick={() => handleFitlerByCategory(cat.category)}/>
            ))}
          </div>

          {showRightCatButton &&
            <button className='absolute right-0 md:-right-10 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64525] z-10 cursor-pointer' onClick={() => scrollHandler(catScrollRef, 'right')}>
              <FaCircleChevronRight/>
            </button>
          }

        </div>
      </div>

      {/* Shops */}
      <div className='w-screen max-w-6xl flex flex-col gap-5 items-start p-2.5 mt-5'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Best Shop in {currentCity}</h1>
        <div className='w-full relative'>

          {showLeftShopButton &&
            <button className='absolute left-0 md:-left-10 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64525] z-10 cursor-pointer' onClick={() => scrollHandler(shopScrollRef, 'left')}>
              <FaCircleChevronLeft/>
            </button>
          }

          <div className='w-full flex overflow-x-auto gap-4 pb-2' ref={shopScrollRef}>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)}/>
            ))}
          </div>

          {showRightShopButton &&
            <button className='absolute right-0 md:-right-10 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64525] z-10 cursor-pointer' onClick={() => scrollHandler(shopScrollRef, 'right')}>
              <FaCircleChevronRight/>
            </button>
          }

        </div>
      </div>

      {/* Food Items */}
      <div className='w-screen max-w-6xl flex flex-col gap-5 items-start p-2.5 mt-5'>
        <h1 className='text-gray-800 text-2xl sm:text-3xl'>Suggested Food Items</h1>

          <div className='w-full h-auto flex flex-wrap gap-5 justify-center'>
          {updatedItemsList?.map((item, index) => (
            <FoodCard key={index} data={item}/>
            ))}
          </div>
      </div>
      <Footer />
    </div>
  )
}

export default UserDashboard
