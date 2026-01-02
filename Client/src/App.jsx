import React from 'react'
import {Routes, Route, Router, Navigate} from 'react-router-dom';
import Home from './Pages/Home';
import SignUp from './Pages/SignUp';
import SignIn from './Pages/SignIn';
import ForgotPassword from './Pages/ForgotPassword';
import useGetCurrentUser from './Hooks/useGetCurrentUser';
import { useDispatch, useSelector } from 'react-redux';
import useGetCity from './Hooks/useGetCity';
import useGetMyShop from './Hooks/useGetMyShop';
import CreateEditShop from './Pages/CreateEditShop';
import AddFood from './Pages/AddFood';
import EditFood from './Pages/EditFood';
import useGetShopByCity from './Hooks/useGetShopByCity';
import useGetItemsByCity from './Hooks/useGetItemsBycity';
import CartPage from './Pages/CartPage';
import Checkout from './Pages/Checkout';
import OrderPlaced from './Pages/OrderPlaced';
import MyOrders from './Pages/MyOrders';
import useGetMyOrders from './Hooks/useGetMyOrders';
import useUpdateLocation from './Hooks/useUpdateLocation';
import TrackOrderPage from './Pages/TrackOrderPage';
import Shop from './Pages/Shop';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { setSocket } from './Redux/userSlice';

export const serverUrl = import.meta.env.VITE_SERVER_URL;

const App = () => {
  useGetCurrentUser();
  useGetCity();
  useGetMyShop();
  useGetShopByCity();
  useGetItemsByCity();
  useGetMyOrders();
  useUpdateLocation();

  const dispatch = useDispatch();

  const {userData} = useSelector((state) => state.user);

  useEffect(() => {
    const socketInstance = io(serverUrl, {
      withCredentials: true,
    });
    dispatch(setSocket(socketInstance));
    socketInstance.on('connect', () => {
      if(userData) {
        socketInstance.emit('identity', {userId: userData._id})
      }
    })

    return () => {
      socketInstance.disconnect();
    }

  }, [userData?._id]);

  return (
    <div>
      <Routes>
        <Route path='/' element={userData ? <Home/> : <Navigate to='/signin'/>}/>
        <Route path='/signup' element={!userData ? <SignUp/> : <Navigate to='/'/>}/>
        <Route path='/signin' element={!userData ? <SignIn/> : <Navigate to='/'/>}/>
        <Route path='/forgotPassword' element={!userData ? <ForgotPassword/> : <Navigate to='/'/>}/>
        <Route path='/create-edit-shop' element={userData ? <CreateEditShop/> : <Navigate to='/signin'/>}/>
        <Route path='/add-food' element={userData ? <AddFood/> : <Navigate to='/signin'/>}/>
        <Route path='/edit-food/:itemId' element={userData ? <EditFood/> : <Navigate to='/signin'/>}/>
        <Route path='/cart' element={userData ? <CartPage/> : <Navigate to='/signin'/>}/>
        <Route path='/checkout' element={userData ? <Checkout/> : <Navigate to='/signin'/>}/>
        <Route path='/order-placed' element={userData ? <OrderPlaced/> : <Navigate to='/signin'/>}/>
        <Route path='/my-orders' element={userData ? <MyOrders/> : <Navigate to='/signin'/>}/>
        <Route path='/track-order/:orderId' element={userData ? <TrackOrderPage/> : <Navigate to='/signin'/>}/>
        <Route path='/shop/:shopId' element={userData ? <Shop/> : <Navigate to='/signin'/>}/>
      </Routes>
    </div>
  )
}

export default App
