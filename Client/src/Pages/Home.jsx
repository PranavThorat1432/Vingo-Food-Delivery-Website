import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../Components/UserDashboard';
import OwnerDashboard from '../Components/OwnerDashboard';
import DeliveryBoydashboard from '../Components/DeliveryBoydashboard';
import Navbar from '../Components/Navbar';

const Home = () => {

  const {userData} = useSelector((state) => state.user);

  return (
    <div className='w-screen min-h-screen pt-[100px] flex flex-col items-center bg-[#fff9f6] '>
      {userData.role === 'User' && <UserDashboard/>}
      {userData.role === 'Owner' && <OwnerDashboard/>}
      {userData.role === 'Delivery-Boy' && <DeliveryBoydashboard/>}
    </div>
  )
}

export default Home
