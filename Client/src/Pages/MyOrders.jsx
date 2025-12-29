import React from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../Components/UserOrderCard";
import OwnerOrderCard from "../Components/OwnerOrderCard";
import { useEffect } from "react";
import { setMyOrders } from "../Redux/userSlice";

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    socket?.on('newOrder', (data) => {
      if(data.shopOrders.owner._id === userData._id) {
        dispatch(setMyOrders([data, ...myOrders]))
      }
    })

    return () => {
      socket?.off('newOrder');
    }
  }, [socket]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-5 mb-6">
          <div className=" z-10 " onClick={() => navigate("/")}>
            <IoIosArrowRoundBack className="w-10 h-10 text-[#ff4d2d] cursor-pointer font-bold" />
          </div>
          <h1 className="text-2xl font-bold text-start">My Orders</h1>
        </div>

        <div className="space-y-6">
          {myOrders?.map((order, index) =>
            userData.role === "User" ? (
              <UserOrderCard key={index} data={order}/>
            ) : userData.role === "Owner" ? (
              <OwnerOrderCard key={index} data={order}/>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
