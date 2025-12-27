import axios from 'axios';
import React from 'react'
import { useEffect } from 'react'
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../Redux/userSlice';

const useGetCurrentUser = () => {
    const dispatch = useDispatch();
    const {userData} = useSelector((state) => state.user);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/current-user`, {
                    withCredentials: true
                });
                dispatch(setUserData(result.data));
                
            } catch (error) {
                console.log(error);
            }
        }
        fetchUser();

    }, [userData, dispatch]);
}

export default useGetCurrentUser
