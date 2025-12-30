import axios from 'axios'
import React from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import DeliveryBoyTracking from '../Components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'

const TrackOrderPage = () => {
  const navigate = useNavigate();

  const {orderId} = useParams();
  const [currentOrder, setCurrentOrder] = useState();
  const [liveLocation, setLiveLocation] = useState({});

  const {socket} = useSelector((state) => state.user);

  const handleGetOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, {
        withCredentials: true
      });
      setCurrentOrder(result.data);
      console.log(result.data)

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    socket.on('updateDeliveryLocation', ({deliveryBoyId, latitude, longitude}) => {
      setLiveLocation(prev => ({
        ...prev,
        [deliveryBoyId]: {lat: latitude, lon: longitude}
      }))
    })
  }, [socket]);

  useEffect(() => {
    handleGetOrder();
  }, [orderId]);

  return (
    <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
      <div className='relative top-5 left-5 z-10 mb-2.5 flex items-center gap-2' onClick={() => navigate('/my-orders')}>
        <IoIosArrowRoundBack className='w-10 h-10 text-[#ff4d2d] cursor-pointer font-bold'/>
        <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
      </div>

      {currentOrder?.shopOrders.map((shopOrder, index) => (
        <div className='bg-white p-4 rounded-2xl shadow-md border border-orange-50 space-y-4' key={index}>
          <div>
            <p className='text-lg font-bold mb-2 text-[#ff4d2d]'>{shopOrder.shop.name}</p>
            <p><span className='font-semibold'>Items:</span> {shopOrder?.shopOrderItems?.map(i => i.name).join(', ')}</p>
            <p><span className='font-semibold'>SubTotal: </span>₹{shopOrder?.subTotal}</p>
            <p className='mt-6'><span className='font-semibold'>Delivery Address: </span>{currentOrder?.deliveryAddress?.text}</p>
          </div>
          
          {shopOrder.deliveryStatus !== 'Delivered' ? 
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className='text-sm text-gray-700'>
                  <p className='font-semibold'><span>Delivery Boy Name: </span> {shopOrder.assignedDeliveryBoy.fullName}</p>
                  <p className='font-semibold'><span>Delivery Boy Mobile: </span> {shopOrder.assignedDeliveryBoy.mobileNo}</p>
                </div>
              ) : (
                <p className='font-semibold '>Delivery Boy is not assigned yet.</p>
              )}
            </> 
            : <p className='text-green-600 font-semibold text-lg'>Delivered</p>
          }

          {(shopOrder.assignedDeliveryBoy && shopOrder.deliveryStatus !== 'Delivered') &&
            <div className='h-[400px] w-full rounded-2xl overflow-hidden shadow-md'>
              <DeliveryBoyTracking data={{
                deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy._id] || {
                  lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
                  lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress.latitude,
                  lon: currentOrder.deliveryAddress.longitude,
                }
              }}/>
            </div>
          }
        </div>
      ))}
    </div>
  )
}

export default TrackOrderPage
