import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux'
import { setCurrentCity, setCurrentState, setCurrentAddress } from '../Redux/userSlice';
import { setAddress, setLocation } from '../Redux/mapSlice';

const useUpdateLocation = () => {
    const dispatch = useDispatch();
    const ApiKey = import.meta.env.VITE_GEO_API_KEY;
    const {userData} = useSelector((state) => state.user);

    useEffect(() => {

        const updateLocation = async (lat, lon) => {
            const result = await axios.post(`${serverUrl}/api/user/update-location`, {
                lat, lon
            }, {
                withCredentials: true
            });
            
        };

        navigator.geolocation.watchPosition((position) => {
            updateLocation(position.coords.latitude, position.coords.longitude);
        }); 

    }, [userData]); 
    
}
 
export default useUpdateLocation;
