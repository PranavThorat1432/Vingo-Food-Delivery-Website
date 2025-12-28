import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../Redux/ownerSlice';
import { setMyOrders } from '../Redux/userSlice';


const useGetMyOrders = () => {
    const dispatch = useDispatch();
    const {userData} = useSelector((state) => state.user);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/order/my-orders`, {
                    withCredentials: true
                });
                // console.log(result.data)
                dispatch(setMyOrders(result.data));
                
            } catch (error) {
                console.log(error);
            }
        }
        fetchOrders();

    }, [userData]);
}

export default useGetMyOrders
