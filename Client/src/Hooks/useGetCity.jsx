import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentCity, setCurrentState, setCurrentAddress } from '../Redux/userSlice';
import { setAddress, setLocation } from '../Redux/mapSlice';

const useGetCity = () => {
    const dispatch = useDispatch();
    const ApiKey = import.meta.env.VITE_GEO_API_KEY;
    const {userData} = useSelector((state) => state.user);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            dispatch(setLocation({lat: latitude, lon: longitude}));
            // dispatch(setLocation({lat: 20.9901595, lon: 75.5342235}));

            const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${ApiKey}`);

            // const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=20.9901595&lon=75.5342235&format=json&apiKey=${ApiKey}`);


            dispatch(setCurrentCity(result?.data?.results[0].city));
            dispatch(setCurrentState(result?.data?.results[0].state));
            dispatch(setCurrentAddress(result?.data?.results[0].address_line1 + ", " + result?.data?.results[0].address_line2));
            dispatch(setAddress(result?.data?.results[0].address_line1 + ", " + result?.data?.results[0].address_line2));

        }); // 20.9901595,75.5342235    21.00488102144464, 75.53525901174721
    }, [userData]); 
    
}
 
export default useGetCity;
