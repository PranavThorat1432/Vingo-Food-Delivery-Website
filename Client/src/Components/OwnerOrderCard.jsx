import axios from "axios";
import React from "react";
import { MdPhone } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { updateOrderStatus } from "../Redux/userSlice";
import { useState } from "react";
import { FaCreditCard } from "react-icons/fa6";
import { RiSecurePaymentFill } from "react-icons/ri";



const OwnerOrderCard = ({ data }) => {

  const [availableBoys, setAvailableBoys] = useState([]);
  const dispatch = useDispatch();

  const handleUpdateStatus = async (orderId, shopId, status) => {
    try {
      const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`, {status}, {
        withCredentials: true
      });
      
      dispatch(updateOrderStatus({orderId, shopId, status}));
      setAvailableBoys(result.data.availableBoys);
      console.log(result.data)

    } catch (error) {
      console.log(error);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data.user.fullName}
        </h2>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdEmail />
          <span>{data.user.email}</span>
        </p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone />
          <span>{data.user.mobileNo}</span>
        </p>
        {data.paymentMethod == 'Online' ? (
          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <RiSecurePaymentFill/>
            Payment: {data.payment ? 'True' : 'False'}
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
            <FaCreditCard/>
            Payment Method: {data.paymentMethod}
          </p>
        )}
      </div>

      <div className="flex items-start flex-col gap-2 text-gray-600 text-sm">
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdLocationOn /> <span>{data.deliveryAddress.text}</span>
        </p>
        <p className="text-xs text-gray-500">
          Lat: {data.deliveryAddress.latitude}, Lon:{" "}
          {data.deliveryAddress.longitude}
        </p>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data.shopOrders?.shopOrderItems.map((item, index) => (
          <div
            key={index}
            className="shrink-0 w-40 border rounded-lg p-2 bg-white"
          >
            <img
              src={item.item.image}
              alt=""
              className="w-full h-24 object-cover rounded"
            />
            <p className="text-sm font-semibold mt-1">{item.item.name}</p>
            <p className="text-xs text-gray-500">
              Qty: {item.quantity} x ₹{item.price}{" "}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">Status: <span className="font-semibold capitalize text-[#ff4d2d]">{data.shopOrders.deliveryStatus}</span></span>

        <select className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-1 border-[#ff4d2d] text-[#ff4d2d]" onChange={(e) => handleUpdateStatus(data._id, data.shopOrders.shop._id, e.target.value)}>
          <option value="">Change Status</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
        </select>
      </div>

      {data.shopOrders.deliveryStatus === 'Out for Delivery' && 
        <div className="mt-3 p-2 border rounded-lg text-sm bg-orange-50">
          {data.shopOrders.assignedDeliveryBoy ? <p>Assigned Delivery Boy: </p> : <p>Available Delivery Boys: </p>}
          {availableBoys.length > 0 ? (
            availableBoys.map((db, index) => (
              <div className="text-gray-600" key={index}>{db?.fullName} - {db?.mobileNo}</div>
            ))
          ) : data.shopOrders.assignedDeliveryBoy ? 
            <div>{data.shopOrders.assignedDeliveryBoy.fullName} - {data.shopOrders.assignedDeliveryBoy.mobileNo}</div> 
            : <div>Waiting for delivery to be assigned.</div>
          }
        </div>
      }

      <div className="text-right font-bold text-gray-800 text-sm">
        Total: ₹{data.shopOrders.subTotal}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
