import axios from 'axios';
import { useEffect, useState } from 'react';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setItemsInMyCity } from '../Redux/userSlice';

const useGetItemsByCity = () => {
    const dispatch = useDispatch();
    const { currentCity } = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchItems = async () => {
            if (!currentCity) {
                dispatch(setItemsInMyCity([]));
                return;
            }

            setIsLoading(true);
            setError(null);
            
            try {
                const result = await axios.get(
                    `${serverUrl}/api/item/get-item-by-city/${currentCity}`, 
                    { withCredentials: true }
                );
                
                if (result.data && Array.isArray(result.data)) {
                    dispatch(setItemsInMyCity(result.data));
                } else {
                    console.error('Unexpected response format:', result.data);
                    setError('Received unexpected data format from server');
                    dispatch(setItemsInMyCity([]));
                }
            } catch (error) {
                console.error('Error fetching items:', error);
                setError(error.response?.data?.message || error.message || 'Failed to fetch food items');
                dispatch(setItemsInMyCity([]));
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();

        // Cleanup function
        return () => {
            // Cancel any pending requests if needed
        };
    }, [currentCity, dispatch]);

    return { isLoading, error };
}

export default useGetItemsByCity
