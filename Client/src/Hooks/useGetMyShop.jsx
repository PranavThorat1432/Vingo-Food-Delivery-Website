import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux'
import { setMyShopData } from '../Redux/ownerSlice';


const useGetMyShop = () => {
    const dispatch = useDispatch();
    const {userData} = useSelector((state) => state.user);

    useEffect(() => {
        const fetchShop = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/shop/getMy-shop`, {
                    withCredentials: true
                });
                dispatch(setMyShopData(result.data));
                
            } catch (error) {
                console.log(error);
            }
        }
        fetchShop();

    }, [userData, dispatch]);
}

export default useGetMyShop
