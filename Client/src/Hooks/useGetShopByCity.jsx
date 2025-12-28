import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux'
import { setShopInMyCity, setUserData } from '../Redux/userSlice';

const useGetShopByCity = () => {
    const dispatch = useDispatch();
    const {currentCity} = useSelector((state) => state.user);

    useEffect(() => {
        const fetchShops = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/shop/getShop-by-city/${currentCity}`, {
                    withCredentials: true
                });
                dispatch(setShopInMyCity(result.data));
                
            } catch (error) {
                console.log(error);
            }
        }
        fetchShops();

    }, [currentCity, dispatch]);
}

export default useGetShopByCity
